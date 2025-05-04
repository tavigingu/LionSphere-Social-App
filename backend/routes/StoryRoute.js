// Modify backend/routes/StoryRoute.js
import express from "express";
import { verifyToken, allowGuest } from '../middleware/AuthMiddleware.js';
import { 
    createStory, 
    getTimelineStories, 
    viewStory, 
    deleteStory,
    likeStory,
    getStoryLikes
} from "../controller/StoryController.js";

const router = express.Router();

// Mixed routes - some available to guests
router.get("/:userId/timeline", allowGuest, getTimelineStories);

// Protected routes
router.post("/", verifyToken, createStory);
router.put("/:storyId/view", verifyToken, viewStory);
router.delete("/:storyId", verifyToken, deleteStory);
router.put("/:storyId/like", verifyToken, likeStory);
router.get("/:storyId/likes", verifyToken, getStoryLikes);

export default router;