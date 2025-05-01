// frontend/src/types/StatisticsTypes.ts

export type TimeframeType = "week" | "month" | "year";

// Urmăritori
export interface FollowersSummary {
  totalFollowers: number;
  totalFollowing: number;
  followerRatio: number;
  mostRecentFollowers: Array<{
    _id: string;
    username: string;
    profilePicture?: string;
    followedAt: string;
  }>;
}

// Sumar postări
export interface PostsSummary {
  totalPosts: number;
  postsInPeriod: number;
  engagement: {
    total: {
      likes: number;
      comments: number;
      saves: number;
      total: number;
    };
    recent: {
      likes: number;
      comments: number;
      saves: number;
      total: number;
    };
    average: {
      likesPerPost: string;
      commentsPerPost: string;
      savesPerPost: string;
    };
  };
}

// Engagement per postare
export interface PostEngagement {
  date: string;
  likes: number;
  comments: number;
  saves: number;
  total: number;
  postCount: number;
}

// Postări după ziua săptămânii
export interface PostsByDay {
  day: string;
  count: number;
}

// Tipuri de interacțiuni
export interface EngagementType {
  name: string;
  value: number;
  color: string;
}

// Postări populare
export interface TopPost {
  postId: string;
  date: string;
  desc: string;
  image: string;
  likes: number;
  comments: number;
  saves: number;
  total: number;
}

// Activitate recentă
export interface RecentActivity {
  type: string;
  notifType?: string;
  userId: string;
  targetId?: string;
  postId?: string;
  message?: string;
  text?: string;
  createdAt: string;
}

// Date statistice complete
export interface StatsData {
  followersSummary: FollowersSummary;
  postsSummary: PostsSummary;
  postEngagement: PostEngagement[];
  postsByDay: PostsByDay[];
  engagementByType: EngagementType[];
  topPosts: TopPost[];
  recentActivity: RecentActivity[];
}