// backend/routes/StatisticsRoute.js
import express from "express";
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

// Rută principală pentru a obține toate statisticile unui utilizator
router.get("/user/:userId", getUserStatistics);

// Rute individuale pentru statistici specifice
router.get("/user/:userId/followers", getFollowersData);
router.get("/user/:userId/posts", getPostsData);
router.get("/post/:userId/top", getTopPosts);
router.get("/post/:userId/byday", getPostsByDay);
router.get("/user/:userId/engagement-types", getEngagementByType);
router.get("/user/:userId/activity", getRecentActivity);

export default router;