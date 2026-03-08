// middleware/rateLimiter.js
import { rateLimit } from 'express-rate-limit';

export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minute window
    limit: 5, // Limit each IP to 5 requests per window
    message: {
        message: "Too many attempts from this IP, please try again after 15 minutes.",
        error: true,
        success: false
    },
    standardHeaders: 'draft-7',
    legacyHeaders: false,
});