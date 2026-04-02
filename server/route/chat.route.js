import { Router } from "express";
import { chatWithKiel, chatWithKielStream } from "../controllers/chat.controller.js";
import { chatBurstLimiter, chatDailyLimiter } from "../middleware/chatLimiter.js";
import { optionalAuth, optionalUserDetails } from "../middleware/auth.js";

const chatRouter = Router();

// ── Rate Limit Logic ────────────────────────────────────────────────────────
// 1. Identify user (if logged in)
// 2. Fetch role (to check if bypass is needed)
// 3. Apply limits (Daily cap then burst/spam guard)
const limiterStack = [optionalAuth, optionalUserDetails, chatDailyLimiter, chatBurstLimiter];

chatRouter.post("/message",        ...limiterStack, chatWithKiel);          // Legacy fallback
chatRouter.post("/message/stream", ...limiterStack, chatWithKielStream);    // SSE streaming

export default chatRouter;
