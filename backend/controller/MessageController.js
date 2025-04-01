import MessageModel from "../models/MessageModel.js";
import ChatModel from "../models/ChatModel.js";
import UserModel from "../models/UserModel.js";
import mongoose from "mongoose";

// Get messages for a specific chat
export const getChatMessages = async (req, res) => {
    try {
        const { chatId } = req.params;
        const { page = 1, limit = 20 } = req.query;
        
        // Convert to numbers
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        
        // Calculate skip value for pagination
        const skip = (pageNum - 1) * limitNum;
        
        // Find messages, sorted by creation time (newest first), with pagination
        const messages = await MessageModel.find({ chatId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum);
        
        // Get total message count for pagination info
        const totalMessages = await MessageModel.countDocuments({ chatId });
        
        // Check if there are more messages to load
        const hasMore = skip + messages.length < totalMessages;
        
        // Get sender info for each message
        const messagesWithSenderInfo = [];
        const senderIds = [...new Set(messages.map(msg => msg.senderId))];
        
        // Fetch all senders in one query
        const senders = await UserModel.find({ 
            _id: { $in: senderIds } 
        }).select('username profilePicture');
        
        // Create a map for quick lookup
        const senderMap = {};
        senders.forEach(sender => {
            senderMap[sender._id] = {
                username: sender.username,
                profilePicture: sender.profilePicture
            };
        });
        
        // Add sender info to each message
        for (const message of messages) {
            messagesWithSenderInfo.push({
                ...message.toObject(),
                sender: senderMap[message.senderId] || { username: 'Unknown User' }
            });
        }
        
        res.status(200).json({
            message: "Messages retrieved successfully",
            success: true,
            messages: messagesWithSenderInfo.reverse(), // Reverse to get oldest first
            hasMore,
            page: pageNum,
            totalMessages
        });
        
    } catch (error) {
        res.status(500).json({
            message: error.message || error,
            success: false
        });
    }
};

// Send a new message
// Send a new message
export const sendMessage = async (req, res) => {
    try {
        const { chatId, senderId, text, image, replyTo } = req.body;
        
        if (!chatId || !senderId || (!text && !image)) {
            return res.status(400).json({
                message: "Chat ID, sender ID, and either text or image are required",
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
        
        // Check if sender is a participant
        if (!chat.participants.includes(senderId)) {
            return res.status(403).json({
                message: "Sender is not a participant in this chat",
                success: false
            });
        }
        
        // Create the new message
        const newMessage = new MessageModel({
            chatId,
            senderId,
            text: text || "",
            image,
            readBy: [senderId], // Mark as read by sender
            replyTo: replyTo || null
        });
        
        const savedMessage = await newMessage.save();
        
        // Update the chat with latest message and increment unread count for other participants
        const unreadCount = chat.unreadCount || new Map();
        
        for (const participant of chat.participants) {
            if (participant !== senderId) {
                // Increment unread count for other participants
                const currentCount = unreadCount.get(participant) || 0;
                unreadCount.set(participant, currentCount + 1);
            }
        }
        
        // Update the chat
        await ChatModel.findByIdAndUpdate(chatId, {
            latestMessage: savedMessage._id,
            unreadCount,
            $set: { updatedAt: new Date() } // Force updatedAt to change for sorting
        });
        
        // If message references another message, fetch that message
        let replyToMessage = null;
        if (replyTo) {
            replyToMessage = await MessageModel.findById(replyTo);
        }
        
        // Get sender info
        const sender = await UserModel.findById(senderId)
            .select('username profilePicture');
        
        // Use Socket.io to notify recipients in real-time
        const io = req.app.get('io');
        if (io) {
            // Notify all participants except the sender
            const recipients = chat.participants.filter(p => p !== senderId);
            
            for (const recipientId of recipients) {
                io.to(`user_${recipientId}`).emit('new_message', {
                    chatId,
                    message: {
                        ...savedMessage.toObject(),
                        sender: {
                            username: sender.username,
                            profilePicture: sender.profilePicture
                        },
                        replyToMessage
                    }
                });
            }
        }
        
        res.status(201).json({
            message: "Message sent successfully",
            success: true,
            sentMessage: {
                ...savedMessage.toObject(),
                sender: {
                    username: sender.username,
                    profilePicture: sender.profilePicture
                },
                replyToMessage
            }
        });
        
    } catch (error) {
        res.status(500).json({
            message: error.message || error,
            success: false
        });
    }
};

// Delete a message
export const deleteMessage = async (req, res) => {
    try {
        const { messageId, userId } = req.body;
        
        if (!messageId || !userId) {
            return res.status(400).json({
                message: "Message ID and user ID are required",
                success: false
            });
        }
        
        // Find the message
        const message = await MessageModel.findById(messageId);
        
        if (!message) {
            return res.status(404).json({
                message: "Message not found",
                success: false
            });
        }
        
        // Check if user is the sender
        if (message.senderId !== userId) {
            return res.status(403).json({
                message: "You can only delete your own messages",
                success: false
            });
        }
        
        // Soft delete - update text to indicate deletion
        await MessageModel.findByIdAndUpdate(messageId, {
            text: "This message was deleted",
            image: null
        });
        
        res.status(200).json({
            message: "Message deleted successfully",
            success: true
        });
        
    } catch (error) {
        res.status(500).json({
            message: error.message || error,
            success: false
        });
    }
};

// Mark message as read
export const markMessageAsRead = async (req, res) => {
    try {
        const { messageId, userId } = req.body;
        
        if (!messageId || !userId) {
            return res.status(400).json({
                message: "Message ID and user ID are required",
                success: false
            });
        }
        
        // Find the message
        const message = await MessageModel.findById(messageId);
        
        if (!message) {
            return res.status(404).json({
                message: "Message not found",
                success: false
            });
        }
        
        // Add user to readBy if not already there
        if (!message.readBy.includes(userId)) {
            await MessageModel.findByIdAndUpdate(messageId, {
                $addToSet: { readBy: userId }
            });
        }
        
        // Check if this was the last unread message in the chat
        const unreadMessages = await MessageModel.countDocuments({
            chatId: message.chatId,
            readBy: { $ne: userId },
            senderId: { $ne: userId } // Don't count user's own messages
        });
        
        // If no more unread messages, update the chat's unread count
        if (unreadMessages === 0) {
            await ChatModel.findByIdAndUpdate(message.chatId, {
                $set: { [`unreadCount.${userId}`]: 0 }
            });
        }
        
        res.status(200).json({
            message: "Message marked as read",
            success: true,
            unreadCount: unreadMessages
        });
        
    } catch (error) {
        res.status(500).json({
            message: error.message || error,
            success: false
        });
    }
};