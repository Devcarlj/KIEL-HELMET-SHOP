// middleware/chatLimiter.js
// ─── Chat-Specific "Bouncer" ─────────────────────────────────────────────────
// Two layers of protection for the Gemini free-tier budget:
//   1. Burst limiter  → max 3 messages per minute  (stops spam / double-clicks)
//   2. Daily limiter  → max 20 messages per day     (protects the 1,000 req/day quota)
//
// Both use IP-based keying so no auth is required.

import { rateLimit } from 'express-rate-limit';

// ── Layer 1: Burst / Spam Guard ──────────────────────────────────────────────
export const chatBurstLimiter = rateLimit({
    windowMs: 60 * 1000, // 1-minute window
    limit: 3,            // 3 messages per minute
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    skip: (req) => req.user?.role === 'ADMIN',
    message: {
        error: true,
        success: false,
        message: "Easy on the throttle, rider! 🏍️ You can send 3 messages per minute. Take a breather and try again shortly.",
        limitType: "burst",
    },
});

// ── Layer 2: Daily Budget Guard ──────────────────────────────────────────────
export const chatDailyLimiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24-hour window
    limit: 10,                       // 10 messages per day per IP
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    skip: (req) => req.user?.role === 'ADMIN',
    // Append today's date to the key so the counter auto-resets at midnight
    keyGenerator: (req) => {
        const today = new Date().toISOString().slice(0, 10); // "2026-03-31"
        const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
        return `${ip}-${today}`;
    },
    message: {
        error: true,
        success: false,
        message: "You've used all 10 messages for today! 🛑 Check out our helmets or come back tomorrow for more help from Kiel.",
        limitType: "daily",
    },
});
