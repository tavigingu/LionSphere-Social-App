import express from "express";
import { 
    createIssueReport, 
    createPostReport, 
    getAllReports,
    getReportedPosts,
    updateReportStatus
} from "../controller/ReportController.js";

const router = express.Router();

// Submit a general issue report
router.post("/issue", createIssueReport);

// Submit a post report
router.post("/post", createPostReport);

// Get all reports (admin)
router.get("/", getAllReports);

// Get reported posts (admin)
router.get("/posts", getReportedPosts);

// Update report status (admin)
router.put("/:reportId", updateReportStatus);

export default router;