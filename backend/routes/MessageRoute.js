// Modify backend/routes/MessageRoute.js
import express from "express";
import { verifyToken } from '../middleware/AuthMiddleware.js';
import { 
    getChatMessages, 
    sendMessage, 
    deleteMessage, 
    markMessageAsRead 
} from "../controller/MessageController.js";

const router = express.Router();

// All message routes require authentication
router.use(verifyToken);

// Message routes
router.get("/:chatId", getChatMessages);
router.post("/", sendMessage);
router.delete("/", deleteMessage);
router.put("/read", markMessageAsRead);

export default router;