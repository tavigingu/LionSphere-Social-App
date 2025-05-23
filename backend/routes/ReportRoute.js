// Modify backend/routes/ReportRoute.js
import express from "express";
import { verifyToken, authorize } from '../middleware/AuthMiddleware.js';
import { 
    createIssueReport, 
    createPostReport, 
    getAllReports,
    getReportedPosts,
    updateReportStatus
} from "../controller/ReportController.js";

const router = express.Router();

// Protected routes - any authenticated user can create reports
router.post("/issue", verifyToken, createIssueReport);
router.post("/post", verifyToken, createPostReport);

// Admin-only routes
router.get("/", verifyToken, authorize('admin'), getAllReports);
router.get("/posts", verifyToken, authorize('admin'), getReportedPosts);
router.put("/:reportId", verifyToken, authorize('admin'), updateReportStatus);

export default router;