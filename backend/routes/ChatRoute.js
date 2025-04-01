import express from "express";
import { 
    getUserChats, 
    getOrCreateChat, 
    markChatAsRead, 
    deleteChat 
} from "../controller/ChatController.js";

const router = express.Router();

// Get all chats for a user
router.get("/:userId", getUserChats);

// Get or create a chat between two users
router.post("/", getOrCreateChat);

// Mark chat as read for a user
router.put("/read", markChatAsRead);

// Delete chat (only removes for the current user)
router.delete("/", deleteChat);

export default router;