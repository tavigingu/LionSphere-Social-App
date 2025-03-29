// backend/models/StoryModel.js
import mongoose from "mongoose";

const StorySchema = mongoose.Schema(
    {
        userId: {
            type: String,
            required: true,
            ref: 'User'
        },
        image: {
            type: String,
            required: true
        },
        caption: {
            type: String,
            max: 200
        },
        viewers: [String], // Array de IDs ale utilizatorilor care au văzut story-ul
        expiresAt: {
            type: Date,
            required: true,
            default: function() {
                // Implicit expiră după 24 de ore
                const date = new Date();
                date.setHours(date.getHours() + 24);
                return date;
            }
        }
    },
    {
        timestamps: true
    }
);

const StoryModel = mongoose.model('Story', StorySchema);
export default StoryModel;