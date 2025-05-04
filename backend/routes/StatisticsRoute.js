// Modify backend/routes/StatisticsRoute.js
import express from "express";
import { verifyToken } from '../middleware/AuthMiddleware.js';
import { 
    getUserStatistics,
    getFollowersData,
    getPostsData,
    getTopPosts,
    getPostsByDay,
    getEngagementByType,
    getRecentActivity
} from "../controller/StatisticsController.js";

const router = express.Router();

// All statistics routes require authentication
router.use(verifyToken);

// Statistics routes
router.get("/user/:userId", getUserStatistics);
router.get("/user/:userId/followers", getFollowersData);
router.get("/user/:userId/posts", getPostsData);
router.get("/post/:userId/top", getTopPosts);
router.get("/post/:userId/byday", getPostsByDay);
router.get("/user/:userId/engagement-types", getEngagementByType);
router.get("/user/:userId/activity", getRecentActivity);

export default router;