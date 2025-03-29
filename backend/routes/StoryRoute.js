// backend/routes/StoryRoute.js
import express from "express";
import { 
    createStory, 
    getTimelineStories, 
    viewStory, 
    deleteStory 
} from "../controller/StoryController.js";

const router = express.Router();

router.post("/", createStory);
router.get("/:userId/timeline", getTimelineStories);
router.put("/:storyId/view", viewStory);
router.delete("/:storyId", deleteStory);

export default router;