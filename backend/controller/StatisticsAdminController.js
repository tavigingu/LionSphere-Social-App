// backend/controller/AdminStatisticsController.js
import UserModel from "../models/UserModel.js";
import PostModel from "../models/PostModel.js";
import StoryModel from "../models/StoryModel.js";
import MessageModel from "../models/MessageModel.js";
import NotificationModel from "../models/NotificationModel.js";
import ReportModel from "../models/ReportModel.js";
import mongoose from "mongoose";

/**
 * Helper function to get date range based on timeframe
 */
const getDateRange = (timeframe) => {
    const now = new Date();
    let startDate = new Date();
    
    if (timeframe === 'week') {
        startDate.setDate(now.getDate() - 7);
    } else if (timeframe === 'month') {
        startDate.setMonth(now.getMonth() - 1);
    } else if (timeframe === 'year') {
        startDate.setFullYear(now.getFullYear() - 1);
    } else {
        // Default is month
        startDate.setMonth(now.getMonth() - 1);
    }
    
    return { startDate, endDate: now };
};

/**
 * Get all admin statistics
 */
export const getAdminStatistics = async (req, res) => {
    try {
        const { timeframe = 'month' } = req.query;
        const { startDate, endDate } = getDateRange(timeframe);
        
        // Combine all statistics
        const [
            userStats,
            postStats,
            storyStats,
            reportStats,
            notificationStats
        ] = await Promise.all([
            getUserStats(timeframe, startDate, endDate),
            getPostStats(timeframe, startDate, endDate),
            getStoryStats(timeframe, startDate, endDate),
            getReportStats(timeframe, startDate, endDate),
            getNotificationStats(timeframe, startDate, endDate)
        ]);
        
        res.status(200).json({
            message: "Admin statistics retrieved successfully",
            success: true,
            stats: {
                userStats,
                postStats,
                storyStats,
                reportStats,
                notificationStats
            }
        });
        
    } catch (error) {
        console.error("Error retrieving admin statistics:", error);
        res.status(500).json({
            message: error.message || error,
            success: false
        });
    }
};

/**
 * Get user statistics
 */
const getUserStats = async (timeframe, startDate, endDate) => {
    try {
        // Total users
        const totalUsers = await UserModel.countDocuments();
        
        // New users today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const newUsersToday = await UserModel.countDocuments({
            createdAt: { $gte: today }
        });
        
        // New users this week
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of week (Sunday)
        weekStart.setHours(0, 0, 0, 0);
        const newUsersThisWeek = await UserModel.countDocuments({
            createdAt: { $gte: weekStart }
        });
        
        // New users this month
        const monthStart = new Date();
        monthStart.setDate(1); // First day of month
        monthStart.setHours(0, 0, 0, 0);
        const newUsersThisMonth = await UserModel.countDocuments({
            createdAt: { $gte: monthStart }
        });
        
        // User growth over time
        const userGrowthPipeline = [
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { 
                            format: timeframe === 'week' ? "%Y-%m-%d" : 
                                    timeframe === 'month' ? "%Y-%m-%d" : "%Y-%m",
                            date: "$createdAt" 
                        }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } },
            {
                $project: {
                    date: "$_id",
                    total: "$count",
                    _id: 0
                }
            }
        ];
        
        let userGrowth = await UserModel.aggregate(userGrowthPipeline);
        
        // Format dates for display
        userGrowth = userGrowth.map(item => {
            const date = new Date(item.date);
            return {
                ...item,
                date: date.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: timeframe !== 'year' ? 'numeric' : undefined,
                    year: timeframe === 'year' ? 'numeric' : undefined
                })
            };
        });
        
        // Get user activity by day of week
        
        return {
            totalUsers,
            newUsersToday,
            newUsersThisWeek,
            newUsersThisMonth,
            userGrowth,
            dailyActiveUsers
        };
        
    } catch (error) {
        console.error("Error getting user stats:", error);
        throw error;
    }
};

/**
 * Get post statistics
 */
const getPostStats = async (timeframe, startDate, endDate) => {
    try {
        // Total posts
        const totalPosts = await PostModel.countDocuments();
        
        // New posts today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const newPostsToday = await PostModel.countDocuments({
            createdAt: { $gte: today }
        });
        
        // New posts this week
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        weekStart.setHours(0, 0, 0, 0);
        const newPostsThisWeek = await PostModel.countDocuments({
            createdAt: { $gte: weekStart }
        });
        
        // Post growth over time
        const postGrowthPipeline = [
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { 
                            format: timeframe === 'week' ? "%Y-%m-%d" : 
                                    timeframe === 'month' ? "%Y-%m-%d" : "%Y-%m",
                            date: "$createdAt" 
                        }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } },
            {
                $project: {
                    date: "$_id",
                    total: "$count",
                    _id: 0
                }
            }
        ];
        
        let postGrowth = await PostModel.aggregate(postGrowthPipeline);
        
        // Format dates for display
        postGrowth = postGrowth.map(item => {
            const date = new Date(item.date);
            return {
                ...item,
                date: date.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: timeframe !== 'year' ? 'numeric' : undefined,
                    year: timeframe === 'year' ? 'numeric' : undefined
                })
            };
        });
        
        // Get total likes using aggregation
        const likesAggregation = await PostModel.aggregate([
            {
                $project: {
                    likeCount: { $size: { $ifNull: ["$likes", []] } }
                }
            },
            {
                $group: {
                    _id: null,
                    totalLikes: { $sum: "$likeCount" }
                }
            }
        ]);
        
        const totalLikes = likesAggregation.length > 0 ? likesAggregation[0].totalLikes : 0;
        
        // Get total comments using aggregation
        const commentsAggregation = await PostModel.aggregate([
            {
                $project: {
                    commentCount: { $size: { $ifNull: ["$comments", []] } }
                }
            },
            {
                $group: {
                    _id: null,
                    totalComments: { $sum: "$commentCount" }
                }
            }
        ]);
        
        const totalComments = commentsAggregation.length > 0 ? commentsAggregation[0].totalComments : 0;
        
        // Get interactions over time (likes, comments)
        const interactionPipeline = [
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { 
                            format: timeframe === 'week' ? "%Y-%m-%d" : 
                                    timeframe === 'month' ? "%Y-%m-%d" : "%Y-%m",
                            date: "$createdAt" 
                        }
                    },
                    likes: { $sum: { $size: { $ifNull: ["$likes", []] } } },
                    comments: { $sum: { $size: { $ifNull: ["$comments", []] } } }
                }
            },
            { $sort: { "_id": 1 } },
            {
                $project: {
                    date: "$_id",
                    likes: "$likes",
                    comments: "$comments",
                    _id: 0
                }
            }
        ];
        
        let interactionGrowth = await PostModel.aggregate(interactionPipeline);
        
        // Format dates for display
        interactionGrowth = interactionGrowth.map(item => {
            const date = new Date(item.date);
            return {
                ...item,
                date: date.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: timeframe !== 'year' ? 'numeric' : undefined,
                    year: timeframe === 'year' ? 'numeric' : undefined
                })
            };
        });
        
        return {
            totalPosts,
            newPostsToday,
            newPostsThisWeek,
            postGrowth,
            totalLikes,
            totalComments,
            interactionGrowth
        };
        
    } catch (error) {
        console.error("Error getting post stats:", error);
        throw error;
    }
};

/**
 * Get story statistics
 */
const getStoryStats = async (timeframe, startDate, endDate) => {
    try {
        // Total stories
        const totalStories = await StoryModel.countDocuments();
        
        // New stories today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const newStoriesToday = await StoryModel.countDocuments({
            createdAt: { $gte: today }
        });
        
        // Get total story views
        const viewsAggregation = await StoryModel.aggregate([
            {
                $project: {
                    viewCount: { $size: { $ifNull: ["$viewers", []] } }
                }
            },
            {
                $group: {
                    _id: null,
                    totalViews: { $sum: "$viewCount" }
                }
            }
        ]);
        
        const storyViews = viewsAggregation.length > 0 ? viewsAggregation[0].totalViews : 0;
        
        // Get story views over time
        const viewsPipeline = [
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { 
                            format: timeframe === 'week' ? "%Y-%m-%d" : 
                                    timeframe === 'month' ? "%Y-%m-%d" : "%Y-%m",
                            date: "$createdAt" 
                        }
                    },
                    views: { $sum: { $size: { $ifNull: ["$viewers", []] } } }
                }
            },
            { $sort: { "_id": 1 } },
            {
                $project: {
                    date: "$_id",
                    total: "$views",
                    _id: 0
                }
            }
        ];
        
        let storyViewsGrowth = await StoryModel.aggregate(viewsPipeline);
        
        // Format dates for display
        storyViewsGrowth = storyViewsGrowth.map(item => {
            const date = new Date(item.date);
            return {
                ...item,
                date: date.toLocaleDateString('ro-RO', { 
                    month: 'short', 
                    day: timeframe !== 'year' ? 'numeric' : undefined,
                    year: timeframe === 'year' ? 'numeric' : undefined
                })
            };
        });
        
        return {
            totalStories,
            newStoriesToday,
            storyViews,
            storyViewsGrowth
        };
        
    } catch (error) {
        console.error("Error getting story stats:", error);
        throw error;
    }
};

/**
 * Get report statistics
 */
const getReportStats = async (timeframe, startDate, endDate) => {
    try {
        // Total reports
        const totalReports = await ReportModel.countDocuments();
        
        // Pending reports
        const pendingReports = await ReportModel.countDocuments({ status: 'pending' });
        
        // Get report reasons breakdown
        const reportTypesPipeline = [
            {
                $group: {
                    _id: "$reason",
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ];
        
        const reportTypesResult = await ReportModel.aggregate(reportTypesPipeline);
        
        // Convert to percentages
        const reportTypes = reportTypesResult.map(type => ({
            name: type._id || "Altele",
            value: totalReports > 0 ? Math.round((type.count / totalReports) * 100) : 0
        }));
        
        return {
            totalReports,
            pendingReports,
            reportTypes
        };
        
    } catch (error) {
        console.error("Error getting report stats:", error);
        throw error;
    }
};

/**
 * Get notification statistics
 */
const getNotificationStats = async (timeframe, startDate, endDate) => {
    try {
        // Total notifications
        const totalNotifications = await NotificationModel.countDocuments();
        
        // Get notification types breakdown
        const notificationTypesPipeline = [
            {
                $group: {
                    _id: "$type",
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ];
        
        const notificationTypesResult = await NotificationModel.aggregate(notificationTypesPipeline);
        
        // Map notification types to friendly names and convert to percentages
        const notificationTypes = notificationTypesResult.map(type => ({
            name: type._id === 'like' ? 'Aprecieri' :
                  type._id === 'comment' ? 'Comentarii' :
                  type._id === 'follow' ? 'Urmăriri' :
                  type._id === 'mention' ? 'Menționări' : 
                  type._id || 'Altele',
            value: totalNotifications > 0 ? Math.round((type.count / totalNotifications) * 100) : 0
        }));
        
        return {
            totalNotifications,
            notificationTypes
        };
        
    } catch (error) {
        console.error("Error getting notification stats:", error);
        throw error;
    }
};