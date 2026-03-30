import { GoogleGenerativeAI } from "@google/generative-ai";
import ProductModel from "../models/product.model.js";

// ─── Lazy Singleton ───
let genAIInstance = null;
const getGenAI = () => {
    if (!genAIInstance) {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error("GEMINI_API_KEY is not set");
        genAIInstance = new GoogleGenerativeAI(apiKey);
    }
    return genAIInstance;
};

// ─── Model Fallback Ladder ───────────────────────────────────────────────────
// Performance → Availability: try the best model first, drop down on quota hit
const MODELS_LADDER = [
    "gemini-3-flash-preview",   // 🥇 Best: fastest, most human (lower quota)
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
    "gemini-2.0-flash",         // 🥈 Balanced: thinking model, high quota
    "gemini-1.5-flash",         // 🥉 Indestructible: highest quota (~1,500/day)
];

// ─── Per-Model Generation Config (Polymorphic Switch) ───────────────────────
// Each Gemini generation uses a DIFFERENT thinkingConfig shape.
// Sending the wrong shape causes a 400 Bad Request — this prevents that.
const getGenerationConfig = (modelName) => {
    const base = {
        temperature: 0.5,
        maxOutputTokens: 500,
    };

    if (modelName.startsWith("gemini-3")) {
        // Gemini 3.x: uses string levels ("low", "minimal", "high")
        base.thinkingConfig = { thinkingLevel: "low" };
    } else if (modelName.startsWith("gemini-2.5")) {
        // Gemini 2.5: uses numeric budget (0 = off, 1024 = light thinking)
        base.thinkingConfig = { thinkingBudget: 1024 };
    }
    // Gemini 2.0 and 1.5 do NOT support thinkingConfig — omit it entirely

    return base;
};

// ─── Product Cache (avoid DB hit on every message) ───
let productCache = { data: null, timestamp: 0 };
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const getProductData = async () => {
    const now = Date.now();
    if (productCache.data && (now - productCache.timestamp) < CACHE_TTL) {
        return productCache.data;
    }

    // Limit to Top 20 in-stock products — prevents the system instruction
    // from growing too large as the catalog scales (keeps prefill fast)
    const products = await ProductModel.find({ public: true })
        .select("name price stock discount")
        .sort({ stock: -1, discount: -1 }) // Prioritise in-stock & discounted items
        .limit(20)
        .lean(); // .lean() returns plain JS objects — faster

    const productString = products.map(p => {
        const dp = p.discount > 0 ? Math.round(p.price * (1 - p.discount / 100)) : p.price;
        const price = p.discount > 0 ? `₱${dp} (was ₱${p.price}, -${p.discount}%)` : `₱${dp}`;
        return `- ${p.name}: ${price} | ${p.stock > 0 ? 'In Stock' : 'Sold Out'}`;
    }).join("\n");

    productCache = { data: productString, timestamp: now };
    return productString;
};

// ─── Optimized System Instruction (compact, bullet-point format) ───
const buildSystemInstruction = (productDataString) => `Role: Kiel – AI Pit Crew for Kiel Helmet Shop.
Tone: Biker-to-biker. Concise. Max 2-3 sentences per reply.
Priority: Helmet safety, sizing, product matching.

RULES:
- Use ONLY prices from the product list below. Never invent prices.
- If asked about availability, list relevant products with prices.
- Mention ICC/PS or ECE/DOT certs when discussing safety.
- For sizing questions, advise measuring head circumference in CM.
- Off-topic? Redirect politely to gear talk.
- Complex issue? Offer to connect with the shop owner via Messenger.
- Keep responses SHORT and punchy. Riders want fast answers, not essays.

PRODUCTS:
${productDataString}`;

// ─── Helper: Create a chat session using the model ladder ─────────────────────
// Tries each model in MODELS_LADDER. On quota (429) → drops to the next.
// On any other error (bug, network) → throws immediately (no point retrying).
const createChatSession = async (systemInstruction, history) => {
    const genAI = getGenAI();
    let lastError = null;

    for (const modelName of MODELS_LADDER) {
        try {
            const model = genAI.getGenerativeModel({
                model: modelName,
                systemInstruction,
                generationConfig: getGenerationConfig(modelName),
            });

            const chatSession = model.startChat({ history: history || [] });

            console.log(`✅ Using model: ${modelName}`);
            return { chatSession, modelName };

        } catch (error) {
            const isQuota =
                error.status === 429 ||
                error.message?.includes("429") ||
                error.message?.toLowerCase().includes("quota") ||
                error.message?.toLowerCase().includes("rate limit");

            if (isQuota) {
                console.warn(`⚠️  ${modelName} quota hit — dropping to next model...`);
                lastError = error;
                continue; // Try the next model in the ladder
            }

            // Not a quota error — it's a real bug, throw immediately
            throw error;
        }
    }

    // All models exhausted
    throw lastError || new Error("All AI models in the ladder are unavailable.");
};

// ─── Streaming Endpoint (SSE) — near-instant perceived latency ───────────────
export const chatWithKielStream = async (request, response) => {
    try {
        const { message, history } = request.body;
        const productDataString = await getProductData();
        const systemInstruction = buildSystemInstruction(productDataString);

        // SSE headers — must be sent BEFORE the ladder loop so errors can use SSE too
        response.writeHead(200, {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
            "X-Accel-Buffering": "no", // Disable Nginx/Vercel buffering
        });

        // ── Model Ladder: try each model until one works ──
        let chatSession = null;
        let activeModelName = "";
        let lastLadderError = null;

        for (const modelName of MODELS_LADDER) {
            try {
                const genAI = getGenAI();
                const model = genAI.getGenerativeModel({
                    model: modelName,
                    systemInstruction,
                    generationConfig: getGenerationConfig(modelName),
                });

                chatSession = model.startChat({ history: history || [] });

                // Probe: actually initiate the stream to trigger quota errors now
                const probeResult = await chatSession.sendMessageStream(message);

                console.log(`✅ Streaming with: ${modelName}`);
                activeModelName = modelName;

                // ── Stream the response ──
                for await (const chunk of probeResult.stream) {
                    try {
                        // Debug: log WHY the model stopped generating
                        const finishReason = chunk.candidates?.[0]?.finishReason;
                        if (finishReason) {
                            console.log(`🏁 [${activeModelName}] Finish Reason:`, finishReason);
                        }

                        const text = chunk.text();
                        if (text) {
                            response.write(`data: ${JSON.stringify({ text })}\n\n`);
                        }
                    } catch (chunkError) {
                        // A single bad chunk is skipped — stream continues cleanly
                        console.warn("Skipped malformed stream chunk:", chunkError.message);
                    }
                }

                // Signal completion and exit — no need to try further models
                response.write(`data: ${JSON.stringify({ done: true, model: activeModelName })}\n\n`);
                response.end();
                return;

            } catch (error) {
                const isQuota =
                    error.status === 429 ||
                    error.message?.includes("429") ||
                    error.message?.toLowerCase().includes("quota") ||
                    error.message?.toLowerCase().includes("rate limit");

                if (isQuota) {
                    console.warn(`⚠️  ${modelName} quota hit — dropping to next model in ladder...`);
                    lastLadderError = error;
                    continue;
                }

                // Not a quota error — real bug, report immediately
                throw error;
            }
        }

        // All models exhausted — inform client via SSE (headers already sent)
        const exhaustedMsg = "All AI models are currently at capacity. Please try again in a minute.";
        response.write(`data: ${JSON.stringify({ error: exhaustedMsg })}\n\n`);
        response.end();

    } catch (error) {
        console.error("AI Chat Stream Error:", error);

        if (response.headersSent) {
            response.write(`data: ${JSON.stringify({ error: error.message || "Stream failed" })}\n\n`);
            response.end();
        } else {
            return response.status(500).json({
                error: true,
                success: false,
                message: error.message || error,
            });
        }
    }
};

// ─── Legacy Non-Streaming Fallback (also uses the ladder) ────────────────────
export const chatWithKiel = async (request, response) => {
    try {
        const { message, history } = request.body;
        const productDataString = await getProductData();
        const systemInstruction = buildSystemInstruction(productDataString);

        const { chatSession, modelName } = await createChatSession(systemInstruction, history);

        const result = await chatSession.sendMessage(message);
        const reply = result.response.text();

        console.log(`✅ [Legacy] Response from: ${modelName}`);

        return response.json({
            error: false,
            success: true,
            message: "Chat response retrieved successfully",
            data: { reply }
        });
    } catch (error) {
        console.error("AI Chat Error:", error);
        return response.status(500).json({
            error: true,
            success: false,
            message: error.message || error,
        });
    }
};
