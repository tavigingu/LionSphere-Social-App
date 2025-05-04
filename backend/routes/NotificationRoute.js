// import express from "express";
// import { 
//     getNotifications, 
//     markAsRead, 
//     createNotification, 
//     getUnreadCount,
//     deleteNotification
// } from "../controller/NotificationController.js";

// const router = express.Router();

// // Get all notifications for a user
// router.get("/:userId", getNotifications);

// // Get unread notification count
// router.get("/:userId/unread", getUnreadCount);

// // Create a new notification
// router.post("/", createNotification);

// // Mark notification(s) as read
// router.put("/:notificationId/read", markAsRead);

// // Mark all notifications as read
// router.put("/read-all", markAsRead);

// // Delete a notification
// router.delete("/:notificationId", deleteNotification);

// export default router;

// Modify backend/routes/NotificationRoute.js
import express from "express";
import { verifyToken } from '../middleware/AuthMiddleware.js';
import { 
    getNotifications, 
    markAsRead, 
    createNotification, 
    getUnreadCount,
    deleteNotification
} from "../controller/NotificationController.js";

const router = express.Router();

// All notification routes require authentication
router.use(verifyToken);

// Notification routes
router.get("/:userId", getNotifications);
router.get("/:userId/unread", getUnreadCount);
router.post("/", createNotification);
router.put("/:notificationId/read", markAsRead);
router.put("/read-all", markAsRead);
router.delete("/:notificationId", deleteNotification);

export default router;