import { Router } from "express";
import { chatWithKiel, chatWithKielStream } from "../controllers/chat.controller.js";
import { chatBurstLimiter, chatDailyLimiter } from "../middleware/chatLimiter.js";

const chatRouter = Router();

// Both routes go through the "bouncer" stack: daily cap first, then burst guard
chatRouter.post("/message",        chatDailyLimiter, chatBurstLimiter, chatWithKiel);          // Legacy fallback
chatRouter.post("/message/stream", chatDailyLimiter, chatBurstLimiter, chatWithKielStream);    // SSE streaming

export default chatRouter;
