// backend/routes/AdminStatisticsRoute.js
import express from "express";
import { getAdminStatistics } from "../controller/StatisticsAdminController.js";


const router = express.Router();

router.use(verifyToken);
router.use(isAdmin);

// Main endpoint for all admin statistics
router.get("/", getAdminStatistics);

export default router;