import ChatModel from "../models/ChatModel.js";
import UserModel from "../models/UserModel.js";
import MessageModel from "../models/MessageModel.js";

// Get all chats for a user
export const getUserChats = async (req, res) => {
    try {
        const userId = req.params.userId;
        
        // Find all chats where the user is a participant
        const chats = await ChatModel.find({
            participants: { $in: [userId] }
        }).sort({ updatedAt: -1 });  // Most recent chats first
        
        // Get participants' info to display in chat list
        const enhancedChats = [];
        
        for (const chat of chats) {
            // For each chat, get the other participant's info
            const otherParticipantIds = chat.participants.filter(id => id !== userId);
            
            // Get basic info for all other participants
            const participants = await UserModel.find({
                _id: { $in: otherParticipantIds }
            }).select('username profilePicture firstname lastname');
            
            // Get the latest message for preview
            let latestMessage = null;
            if (chat.latestMessage) {
                latestMessage = await MessageModel.findById(chat.latestMessage)
                    .select('text senderId createdAt readBy');
            }
            
            // Get unread count for this user
            const unreadCount = chat.unreadCount ? (chat.unreadCount.get(userId) || 0) : 0;
            
            enhancedChats.push({
                _id: chat._id,
                participants,
                latestMessage,
                unreadCount,
                updatedAt: chat.updatedAt
            });
        }
        
        res.status(200).json({
            message: "User chats retrieved successfully",
            success: true,
            chats: enhancedChats
        });
        
    } catch (error) {
        res.status(500).json({
            message: error.message || error,
            success: false
        });
    }
};

// Get or create a chat between two users
export const getOrCreateChat = async (req, res) => {
    try {
        const { userId, otherUserId } = req.body;
        
        if (!userId || !otherUserId) {
            return res.status(400).json({
                message: "Both user IDs are required",
                success: false
            });
        }
        
        // Sort user IDs to ensure consistent chat lookup
        const participants = [userId, otherUserId].sort();
        
        // Check if chat already exists
        let chat = await ChatModel.findOne({
            participants: { $all: participants },
            $expr: { $eq: [{ $size: "$participants" }, 2] } // Ensure exactly 2 participants
        });
        
        // If chat doesn't exist, create it
        if (!chat) {
            chat = new ChatModel({
                participants,
                unreadCount: new Map() // Initialize empty unread counts
            });
            
            await chat.save();
        }
        
        // Get other user's details
        const otherUser = await UserModel.findById(otherUserId)
            .select('username profilePicture firstname lastname');
        
        // Get latest messages for this chat
        const latestMessages = await MessageModel.find({ chatId: chat._id })
            .sort({ createdAt: -1 })
            .limit(1);
        
        const latestMessage = latestMessages.length > 0 ? latestMessages[0] : null;
        
        // Get unread count for this user
        const unreadCount = chat.unreadCount ? (chat.unreadCount.get(userId) || 0) : 0;
        
        res.status(200).json({
            message: "Chat retrieved successfully",
            success: true,
            chat: {
                _id: chat._id,
                participants: [otherUser],
                latestMessage,
                unreadCount,
                updatedAt: chat.updatedAt
            }
        });
        
    } catch (error) {
        res.status(500).json({
            message: error.message || error,
            success: false
        });
    }
};

// Mark chat as read for a user
export const markChatAsRead = async (req, res) => {
    try {
        const { chatId, userId } = req.body;
        
        if (!chatId || !userId) {
            return res.status(400).json({
                message: "Chat ID and user ID are required",
                success: false
            });
        }
        
        // Find the chat
        const chat = await ChatModel.findById(chatId);
        
        if (!chat) {
            return res.status(404).json({
                message: "Chat not found",
                success: false
            });
        }
        
        // Check if user is a participant
        if (!chat.participants.includes(userId)) {
            return res.status(403).json({
                message: "User is not a participant in this chat",
                success: false
            });
        }
        
        // Update unread count for this user to 0
        const unreadCount = chat.unreadCount || new Map();
        unreadCount.set(userId, 0);
        
        // Update the chat
        await ChatModel.findByIdAndUpdate(chatId, {
            unreadCount
        });
        
        // Also mark all messages as read by this user
        await MessageModel.updateMany(
            { 
                chatId,
                readBy: { $ne: userId },
                senderId: { $ne: userId } // Don't mark the user's own messages
            },
            { $addToSet: { readBy: userId } }
        );
        
        res.status(200).json({
            message: "Chat marked as read",
            success: true
        });
        
    } catch (error) {
        res.status(500).json({
            message: error.message || error,
            success: false
        });
    }
};

// Delete chat (only removes for the current user)
export const deleteChat = async (req, res) => {
    try {
        const { chatId, userId } = req.body;
        
        if (!chatId || !userId) {
            return res.status(400).json({
                message: "Chat ID and user ID are required",
                success: false
            });
        }
        
        // Find the chat
        const chat = await ChatModel.findById(chatId);
        
        if (!chat) {
            return res.status(404).json({
                message: "Chat not found",
                success: false
            });
        }
        
        // Check if user is a participant
        if (!chat.participants.includes(userId)) {
            return res.status(403).json({
                message: "User is not a participant in this chat",
                success: false
            });
        }
        
        // Remove user from participants
        await ChatModel.findByIdAndUpdate(chatId, {
            $pull: { participants: userId }
        });
        
        res.status(200).json({
            message: "Chat deleted successfully",
            success: true
        });
        
    } catch (error) {
        res.status(500).json({
            message: error.message || error,
            success: false
        });
    }
};