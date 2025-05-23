// backend/routes/AdminStatisticsRoute.js
import express from "express";
import { getAdminStatistics } from "../controller/StatisticsAdminController.js";
import { verifyToken, authorize } from "../middleware/AuthMiddleware.js";

const router = express.Router();

router.use(verifyToken);
router.use(authorize('admin'));

// Main endpoint for all admin statistics
router.get("/", getAdminStatistics);

export default router;