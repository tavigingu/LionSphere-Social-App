import NotificationModel from "../models/NotificationModel.js";
import UserModel from "../models/UserModel.js";

// Get notifications for a user
export const getNotifications = async (req, res) => {
    try {
        const userId = req.params.userId;
        
        // Find all notifications for the user, sorted by newest first
        const notifications = await NotificationModel.find({ 
            recipientId: userId 
        }).sort({ createdAt: -1 }).limit(50);
        
        // Get all unique sender IDs
        const senderIds = [...new Set(notifications.map(notification => notification.senderId))];
        
        // Get sender data (to display user info in notifications)
        const senders = await UserModel.find({ 
            _id: { $in: senderIds } 
        }).select('username profilePicture');
        
        // Create a map of senderId -> senderData for easy lookup
        const senderMap = {};
        senders.forEach(sender => {
            senderMap[sender._id] = {
                username: sender.username,
                profilePicture: sender.profilePicture
            };
        });
        
        // Enhance notifications with sender data
        const enhancedNotifications = notifications.map(notification => {
            const notificationObj = notification.toObject();
            return {
                ...notificationObj,
                sender: senderMap[notification.senderId] || { username: 'Unknown User' }
            };
        });
        
        res.status(200).json({
            message: "Notifications retrieved successfully",
            success: true,
            notifications: enhancedNotifications,
            unreadCount: notifications.filter(n => !n.read).length
        });
        
    } catch (error) {
        res.status(500).json({
            message: error.message || error,
            success: false
        });
    }
};

// Mark notifications as read
export const markAsRead = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const { allNotifications } = req.body;
        
        if (allNotifications) {
            // Mark all notifications as read for the user
            const userId = req.body.userId;
            await NotificationModel.updateMany(
                { recipientId: userId, read: false },
                { $set: { read: true } }
            );
            
            res.status(200).json({
                message: "All notifications marked as read",
                success: true
            });
        } else {
            // Mark a specific notification as read
            const notification = await NotificationModel.findByIdAndUpdate(
                notificationId,
                { $set: { read: true } },
                { new: true }
            );
            
            if (!notification) {
                return res.status(404).json({
                    message: "Notification not found",
                    success: false
                });
            }
            
            res.status(200).json({
                message: "Notification marked as read",
                success: true,
                notification
            });
        }
    } catch (error) {
        res.status(500).json({
            message: error.message || error,
            success: false
        });
    }
};

// Create a notification
export const createNotification = async (req, res) => {
    try {
        const { recipientId, senderId, type, postId, commentId, message } = req.body;
        
        // Validate required fields based on notification type
        if (!recipientId || !senderId || !type || !message) {
            return res.status(400).json({
                message: "Missing required fields",
                success: false
            });
        }
        
        // Don't create notification if sender is the recipient (self-actions)
        if (recipientId === senderId) {
            return res.status(200).json({
                message: "No notification created for self-action",
                success: true
            });
        }
        
        // For like and comment notifications, postId is required
        if ((type === 'like' || type === 'comment') && !postId) {
            return res.status(400).json({
                message: `PostId is required for ${type} notifications`,
                success: false
            });
        }
        
        // Check for duplicate notification in a short time window to prevent spam
        // For example, multiple likes/unlikes in quick succession
        const existingNotification = await NotificationModel.findOne({
            recipientId,
            senderId,
            type,
            postId: postId || null,
            createdAt: { $gt: new Date(Date.now() - 60 * 1000) } // Within last minute
        });
        
        if (existingNotification) {
            return res.status(200).json({
                message: "Similar notification already exists",
                success: true,
                notification: existingNotification
            });
        }
        
        // Create the new notification
        const newNotification = new NotificationModel({
            recipientId,
            senderId,
            type,
            postId,
            commentId,
            message,
            read: false
        });
        
        const savedNotification = await newNotification.save();
        
        res.status(201).json({
            message: "Notification created successfully",
            success: true,
            notification: savedNotification
        });
        
    } catch (error) {
        res.status(500).json({
            message: error.message || error,
            success: false
        });
    }
};

// Get unread notification count
export const getUnreadCount = async (req, res) => {
    try {
        const userId = req.params.userId;
        
        const count = await NotificationModel.countDocuments({ 
            recipientId: userId,
            read: false
        });
        
        res.status(200).json({
            message: "Unread count retrieved successfully",
            success: true,
            unreadCount: count
        });
        
    } catch (error) {
        res.status(500).json({
            message: error.message || error,
            success: false
        });
    }
};

// Delete a notification
export const deleteNotification = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const { userId } = req.body;
        
        const notification = await NotificationModel.findById(notificationId);
        
        if (!notification) {
            return res.status(404).json({
                message: "Notification not found",
                success: false
            });
        }
        
        // Only allow recipient to delete their notification
        if (notification.recipientId !== userId) {
            return res.status(403).json({
                message: "Not authorized to delete this notification",
                success: false
            });
        }
        
        await NotificationModel.findByIdAndDelete(notificationId);
        
        res.status(200).json({
            message: "Notification deleted successfully",
            success: true
        });
        
    } catch (error) {
        res.status(500).json({
            message: error.message || error,
            success: false
        });
    }
};