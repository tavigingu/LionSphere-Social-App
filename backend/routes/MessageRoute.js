import express from "express";
import { 
    getChatMessages, 
    sendMessage, 
    deleteMessage, 
    markMessageAsRead 
} from "../controller/MessageController.js";

const router = express.Router();

// Get messages for a specific chat
router.get("/:chatId", getChatMessages);

// Send a new message
router.post("/", sendMessage);

// Delete a message
router.delete("/", deleteMessage);

// Mark message as read
router.put("/read", markMessageAsRead);

export default router;