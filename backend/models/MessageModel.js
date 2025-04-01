import mongoose from "mongoose";

const MessageSchema = mongoose.Schema(
    {
        chatId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "Chat"
        },
        senderId: {
            type: String,
            required: true,
            ref: "User"
        },
        text: {
            type: String,
            required: true
        },
        image: {
            type: String
        },
        readBy: [{
            type: String,
            ref: "User"
        }],
        replyTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message"
        }
    },
    {
        timestamps: true
    }
);

// Create indexes for efficient querying
MessageSchema.index({ chatId: 1, createdAt: -1 });
MessageSchema.index({ senderId: 1 });

const MessageModel = mongoose.model("Message", MessageSchema);
export default MessageModel;