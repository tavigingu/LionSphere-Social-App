import express from "express";
import { 
    getNotifications, 
    markAsRead, 
    createNotification, 
    getUnreadCount,
    deleteNotification
} from "../controller/NotificationController.js";

const router = express.Router();

// Get all notifications for a user
router.get("/:userId", getNotifications);

// Get unread notification count
router.get("/:userId/unread", getUnreadCount);

// Create a new notification
router.post("/", createNotification);

// Mark notification(s) as read
router.put("/:notificationId/read", markAsRead);

// Mark all notifications as read
router.put("/read-all", markAsRead);

// Delete a notification
router.delete("/:notificationId", deleteNotification);

export default router;