import { Router } from "express";
import { chatWithKiel, chatWithKielStream } from "../controllers/chat.controller.js";

const chatRouter = Router();

chatRouter.post("/message", chatWithKiel);          // Legacy fallback
chatRouter.post("/message/stream", chatWithKielStream); // SSE streaming

export default chatRouter;
