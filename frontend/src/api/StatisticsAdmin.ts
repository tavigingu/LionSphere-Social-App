// frontend/src/api/StatisticsAdmin.ts
import axios from 'axios';

export type TimeframeType = "week" | "month" | "year";

// User statistics
export interface UserStats {
  totalUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  userGrowth: Array<{ date: string; total: number }>;
  // Note: dailyActiveUsers no longer used, we're using userGrowth for active users visualization
}

// Post statistics
export interface PostStats {
  totalPosts: number;
  newPostsToday: number;
  newPostsThisWeek: number;
  postGrowth: Array<{ date: string; total: number }>;
  totalLikes: number;
  totalComments: number;
  interactionGrowth: Array<{ 
    date: string; 
    likes: number; 
    comments: number; 
  }>;
}

// Story statistics
export interface StoryStats {
  totalStories: number;
  newStoriesToday: number;
  storyViews: number;
  storyViewsGrowth: Array<{ date: string; total: number }>;
}

// Report statistics
export interface ReportStats {
  totalReports: number;
  pendingReports: number;
  reportTypes: Array<{ name: string; value: number }>;
}

// Notification statistics
export interface NotificationStats {
  totalNotifications: number;
  notificationTypes: Array<{ name: string; value: number }>;
}

// Combined admin statistics
export interface AdminStats {
  userStats: UserStats;
  postStats: PostStats;
  storyStats: StoryStats;
  reportStats: ReportStats;
  notificationStats: NotificationStats;
}

const BASE_URL = 'http://localhost:5001';

/**
 * Get all admin statistics
 */
export const getAdminStatistics = async (
  timeframe: TimeframeType = "month"
): Promise<AdminStats> => {
  try {
    console.log(`Fetching admin statistics with timeframe: ${timeframe}`);
    const response = await axios.get(`${BASE_URL}/admin/statistics`, {
      params: { timeframe },
      withCredentials: true
    });
    
    if (response.data.success) {
      console.log("Admin statistics fetched successfully");
      
      // Check and provide fallbacks for missing data
      const stats = response.data.stats || {};
      
      // Create fallback data for any missing properties
      const userStats = stats.userStats || {
        totalUsers: 0,
        newUsersToday: 0,
        newUsersThisWeek: 0,
        newUsersThisMonth: 0,
        userGrowth: []
      };
      
      const postStats = stats.postStats || {
        totalPosts: 0,
        newPostsToday: 0,
        newPostsThisWeek: 0,
        postGrowth: [],
        totalLikes: 0,
        totalComments: 0,
        interactionGrowth: []
      };
      
      const storyStats = stats.storyStats || {
        totalStories: 0,
        newStoriesToday: 0,
        storyViews: 0,
        storyViewsGrowth: []
      };
      
      const reportStats = stats.reportStats || {
        totalReports: 0,
        pendingReports: 0,
        reportTypes: []
      };
      
      const notificationStats = stats.notificationStats || {
        totalNotifications: 0,
        notificationTypes: []
      };
      
      return {
        userStats,
        postStats,
        storyStats,
        reportStats,
        notificationStats
      };
    } else {
      console.error("Failed to fetch admin statistics:", response.data.message);
      throw new Error(response.data.message || 'Failed to fetch admin statistics');
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error fetching admin statistics:', error.response?.data);
      throw new Error(error.response?.data?.message || 'Error fetching admin statistics');
    }
    console.error('Unexpected error:', error);
    throw error;
  }
};