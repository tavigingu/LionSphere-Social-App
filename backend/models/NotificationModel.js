
import mongoose from "mongoose";

const NotificationSchema = mongoose.Schema(
    {
        recipientId: {
            type: String,
            required: true,
            ref: 'User'
        },  
        senderId: {
            type: String,
            required: true,
            ref: 'User'
        },
        type: {
            type: String,
            required: true,
            enum: ['like', 'comment', 'follow', 'mention'],
        },
        postId: {
            type: String,
            ref: 'Post',
            // Only required for like and comment notifications
        },
        commentId: {
            type: String,
            // Only for comment notifications or replies
        },
        read: {
            type: Boolean,
            default: false
        },
        message: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
);

NotificationSchema.index({ recipientId: 1, createdAt: -1 }); // For fetching user's notifications
NotificationSchema.index({ recipientId: 1, read: 1 }); // For counting unread notifications

const NotificationModel = mongoose.model('Notification', NotificationSchema);
export default NotificationModel;