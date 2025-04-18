import ReportModel from "../models/ReportModel.js";
import UserModel from "../models/UserModel.js";
import PostModel from "../models/PostModel.js";

// Create a general issue report
export const createIssueReport = async (req, res) => {
    try {
        const { userId, text, category, type } = req.body;
        
        if (!userId || !text || !category) {
            return res.status(400).json({
                message: "User ID, text, and category are required",
                success: false
            });
        }
        
        // Create report
        const newReport = new ReportModel({
            userId,
            type: type || 'general',
            category,
            text,
            status: 'pending'
        });
        
        const savedReport = await newReport.save();
        
        res.status(201).json({
            message: "Report submitted successfully",
            success: true,
            report: savedReport
        });
        
    } catch (error) {
        res.status(500).json({
            message: error.message || error,
            success: false
        });
    }
};

// Create a post report
export const createPostReport = async (req, res) => {
    try {
        const { userId, postId, postUserId, reason, text, type } = req.body;
        
        if (!userId || !postId || !reason) {
            return res.status(400).json({
                message: "User ID, post ID, and reason are required",
                success: false
            });
        }
        
        // Check if post exists
        const postExists = await PostModel.findById(postId);
        if (!postExists) {
            return res.status(404).json({
                message: "Post not found",
                success: false
            });
        }
        
        // Check if user exists
        const userExists = await UserModel.findById(userId);
        if (!userExists) {
            return res.status(404).json({
                message: "User not found",
                success: false
            });
        }
        
        // Create report
        const newReport = new ReportModel({
            userId,
            type: type || 'post',
            itemId: postId,
            postUserId: postUserId || postExists.userId, // Use provided postUserId or get from post
            reason,
            text,
            status: 'pending'
        });
        
        const savedReport = await newReport.save();
        
        res.status(201).json({
            message: "Report submitted successfully",
            success: true,
            report: savedReport
        });
        
    } catch (error) {
        res.status(500).json({
            message: error.message || error,
            success: false
        });
    }
};

// Get all reports (for admin)
export const getAllReports = async (req, res) => {
    try {
        const { status, type, page = 1, limit = 10 } = req.query;
        
        // Build query based on filters
        let query = {};
        if (status) query.status = status;
        if (type) query.type = type;
        
        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        // Find reports
        const reports = await ReportModel.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));
        
        // Get total count for pagination
        const totalReports = await ReportModel.countDocuments(query);
        
        // Get user details for each report
        const enhancedReports = [];
        for (const report of reports) {
            try {
                const user = await UserModel.findById(report.userId)
                    .select('username profilePicture');
                
                let reportedItem = null;
                if (report.type === 'post' && report.itemId) {
                    reportedItem = await PostModel.findById(report.itemId)
                        .select('desc image');
                }
                
                enhancedReports.push({
                    ...report.toObject(),
                    reporter: user || { username: 'Unknown User' },
                    reportedItem
                });
            } catch (err) {
                console.error(`Error enhancing report data: ${err.message}`);
                enhancedReports.push({
                    ...report.toObject(),
                    reporter: { username: 'Unknown User' }
                });
            }
        }
        
        res.status(200).json({
            message: "Reports fetched successfully",
            success: true,
            reports: enhancedReports,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalReports / parseInt(limit)),
                totalReports
            }
        });
        
    } catch (error) {
        res.status(500).json({
            message: error.message || error,
            success: false
        });
    }
};

// Get reported posts (for admin)
export const getReportedPosts = async (req, res) => {
    try {
        const { status = 'pending', page = 1, limit = 10 } = req.query;
        
        // Build query for post reports
        const query = {
            type: 'post',
            status
        };
        
        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        // Find post reports
        const reports = await ReportModel.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));
        
        // Get total count for pagination
        const totalReports = await ReportModel.countDocuments(query);
        
        // Get post and user details for each report
        const enhancedReports = [];
        for (const report of reports) {
            try {
                const reporter = await UserModel.findById(report.userId)
                    .select('username profilePicture');
                
                const reportedPost = await PostModel.findById(report.itemId)
                    .select('desc image userId');
                
                const postOwner = reportedPost ? 
                    await UserModel.findById(reportedPost.userId).select('username profilePicture') : 
                    null;
                
                enhancedReports.push({
                    ...report.toObject(),
                    reporter: reporter || { username: 'Unknown User' },
                    reportedPost: reportedPost || { desc: 'Post not found' },
                    postOwner: postOwner || { username: 'Unknown User' }
                });
            } catch (err) {
                console.error(`Error enhancing post report data: ${err.message}`);
                enhancedReports.push({
                    ...report.toObject(),
                    reporter: { username: 'Unknown User' },
                    reportedPost: { desc: 'Post not found' },
                    postOwner: { username: 'Unknown User' }
                });
            }
        }
        
        res.status(200).json({
            message: "Reported posts fetched successfully",
            success: true,
            reportedPosts: enhancedReports,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalReports / parseInt(limit)),
                totalReports
            }
        });
        
    } catch (error) {
        res.status(500).json({
            message: error.message || error,
            success: false
        });
    }
};

// Update report status (for admin)
export const updateReportStatus = async (req, res) => {
    try {
        const { reportId } = req.params;
        const { status, adminNote } = req.body;
        
        if (!reportId || !status) {
            return res.status(400).json({
                message: "Report ID and status are required",
                success: false
            });
        }
        
        // Validate status
        if (!['pending', 'reviewed', 'resolved', 'dismissed'].includes(status)) {
            return res.status(400).json({
                message: "Invalid status. Must be one of: pending, reviewed, resolved, dismissed",
                success: false
            });
        }
        
        // Update report
        const updatedReport = await ReportModel.findByIdAndUpdate(
            reportId,
            { 
                $set: { 
                    status,
                    ...(adminNote && { adminNote })
                } 
            },
            { new: true }
        );
        
        if (!updatedReport) {
            return res.status(404).json({
                message: "Report not found",
                success: false
            });
        }
        
        res.status(200).json({
            message: "Report status updated successfully",
            success: true,
            report: updatedReport
        });
        
    } catch (error) {
        res.status(500).json({
            message: error.message || error,
            success: false
        });
    }
};