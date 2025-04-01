import mongoose from "mongoose";

const ChatSchema = mongoose.Schema(
    {
        participants: [{
            type: String,
            required: true,
            ref: "User"
        }],
        latestMessage: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message"
        },
        unreadCount: {
            type: Map,
            of: Number,
            default: new Map()
        }
    },
    {
        timestamps: true
    }
);

// Create a compound index on participants to quickly find chats
ChatSchema.index({ participants: 1 });

const ChatModel = mongoose.model("Chat", ChatSchema);
export default ChatModel;