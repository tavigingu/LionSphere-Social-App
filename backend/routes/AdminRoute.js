// backend/routes/AdminRoute.js
import express from 'express';
import { verifyToken, authorize } from '../middleware/AuthMiddleware.js';
import { getAdminStatistics } from '../controller/StatisticsAdminController.js';
import { getAllReports, getReportedPosts, updateReportStatus } from '../controller/ReportController.js';

const router = express.Router();

// Apply middleware to all routes in this router
router.use(verifyToken);
router.use(authorize('admin'));

// Admin routes
router.get('/statistics', getAdminStatistics);
router.get('/reports', getAllReports);
router.get('/reported-posts', getReportedPosts);
router.put('/reports/:reportId', updateReportStatus);

export default router;