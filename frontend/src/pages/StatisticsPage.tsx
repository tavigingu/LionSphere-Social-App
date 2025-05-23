import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  FaUserFriends,
  FaHeart,
  FaComment,
  FaBookmark,
  FaChartBar,
  FaCalendarAlt,
  FaArrowUp,
  FaArrowDown,
  FaEquals,
  FaExclamationTriangle,
  FaHistory,
  FaFire,
  FaRegClock,
} from "react-icons/fa";
import useAuthStore from "../store/AuthStore";
import Background from "../components/Home/Background";
import Dashboard from "../components/Home/Dashboard";
import { getUserStatistics } from "../api/Statistics";

// Definim tipurile pentru datele primite de la API
interface FollowersSummary {
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

interface PostsSummary {
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

interface PostEngagement {
  date: string;
  likes: number;
  comments: number;
  saves: number;
  total: number;
  postCount: number;
}

interface PostsByDay {
  day: string;
  count: number;
}

interface EngagementType {
  name: string;
  value: number;
  color: string;
}

interface TopPost {
  postId: string;
  date: string;
  desc: string;
  image: string;
  likes: number;
  comments: number;
  saves: number;
  total: number;
}

interface RecentActivity {
  type: string;
  notifType?: string;
  userId: string;
  targetId?: string;
  postId?: string;
  message?: string;
  text?: string;
  createdAt: string;
}

interface StatsData {
  followersSummary: FollowersSummary;
  postsSummary: PostsSummary;
  postEngagement: PostEngagement[];
  postsByDay: PostsByDay[];
  engagementByType: EngagementType[];
  topPosts: TopPost[];
  recentActivity: RecentActivity[];
}

type TimeframeType = "week" | "month" | "year";

const StatisticsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [timeframe, setTimeframe] = useState<TimeframeType>("month");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<StatsData | null>(null);

  // Obține date statistice de la API
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    setLoading(true);
    setError(null);

    const fetchStatistics = async () => {
      try {
        const response = await getUserStatistics(user._id, timeframe);
        setStats(response);
        setLoading(false);
      } catch (err) {
        console.error("Eroare la obținerea statisticilor:", err);
        setError(
          err instanceof Error ? err.message : "Error loading statistics"
        );
        setLoading(false);
      }
    };

    fetchStatistics();
  }, [user, navigate, timeframe]);

  // Afișează indicator de schimbare (pozitiv/negativ/neutru)
  const renderChangeIndicator = (current: number, previous: number) => {
    if (previous === 0) return <span className="text-gray-500">- %</span>;

    const change = ((current - previous) / previous) * 100;

    if (change > 0) {
      return (
        <span className="text-green-500 flex items-center">
          <FaArrowUp className="mr-1" />
          {change.toFixed(1)}%
        </span>
      );
    } else if (change < 0) {
      return (
        <span className="text-red-500 flex items-center">
          <FaArrowDown className="mr-1" />
          {Math.abs(change).toFixed(1)}%
        </span>
      );
    }

    return (
      <span className="text-gray-700 flex items-center">
        <FaEquals className="mr-1" />
        0%
      </span>
    );
  };

  // Găsește ziua cu cele mai multe postări
  const getBestDayToPost = (): string | null => {
    if (!stats || !stats.postsByDay || stats.postsByDay.length === 0)
      return null;

    const bestDay = stats.postsByDay.reduce(
      (max, current) => (current.count > max.count ? current : max),
      stats.postsByDay[0]
    );

    return bestDay.day;
  };

  // Formatează data pentru afișare
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ro-RO", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Convertește numele zilei în română
  const getDayNameInRomanian = (day: string): string => {
    switch (day) {
      case "Lun":
        return "Monday";
      case "Mar":
        return "Tuesday";
      case "Mie":
        return "Wednesday";
      case "Joi":
        return "Thursday";
      case "Vin":
        return "Friday";
      case "Sâm":
        return "Saturday";
      case "Dum":
        return "Sunday";
      default:
        return day.toLowerCase();
    }
  };

  // Stare de încărcare
  if (loading) {
    return (
      <div className="relative min-h-screen">
        <Background />
        <div className="container mx-auto px-4 py-4 relative z-10 lg:pr-96">
          <div className="flex justify-center items-center h-screen">
            <div className="flex flex-col items-center">
              <div className="animate-spin w-12 h-12 border-4 border-t-blue-500 border-blue-200 rounded-full"></div>
              <p className="mt-4 text-lg text-gray-800">
                Loading statistics...
              </p>
            </div>
          </div>
        </div>
        <Dashboard />
      </div>
    );
  }

  // Stare de eroare
  if (error) {
    return (
      <div className="relative min-h-screen">
        <Background />
        <div className="container mx-auto px-4 py-4 relative z-10 lg:pr-96">
          <div className="flex justify-center items-center h-screen">
            <div className="flex flex-col items-center">
              <FaExclamationTriangle className="text-yellow-500 text-4xl mb-4" />
              <p className="mt-2 text-xl text-gray-800">
                Error loading statistics
              </p>
              <p className="mt-1 text-gray-600">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
        <Dashboard />
      </div>
    );
  }

  // Verificăm dacă avem date statistice
  if (!stats) {
    return (
      <div className="relative min-h-screen">
        <Background />
        <div className="container mx-auto px-4 py-4 relative z-10 lg:pr-96">
          <div className="flex justify-center items-center h-screen">
            <div className="flex flex-col items-center">
              <FaExclamationTriangle className="text-yellow-500 text-4xl mb-4" />
              <p className="mt-2 text-xl text-gray-800">
                No statistics data available
              </p>
              <p className="mt-1 text-gray-600">
                Create more posts and interactions to generate statistics.
              </p>
            </div>
          </div>
        </div>
        <Dashboard />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <Background />
      <div className="container mx-auto px-4 py-4 relative z-10 lg:pr-96">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="backdrop-blur-md bg-white/10 rounded-xl p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Account Statistics
                </h1>
                <p className="text-gray-500 mt-1">
                  Track growth and user engagement
                </p>
              </div>
              <div className="mt-4 md:mt-0">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-1 inline-flex">
                  <button
                    onClick={() => setTimeframe("week")}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${
                      timeframe === "week"
                        ? "bg-blue-500 text-gray-800"
                        : "text-gray-800 hover:bg-white/10"
                    }`}
                  >
                    Week
                  </button>
                  <button
                    onClick={() => setTimeframe("month")}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${
                      timeframe === "month"
                        ? "bg-blue-500 text-gray-800"
                        : "text-gray-800 hover:bg-white/10"
                    }`}
                  >
                    Month
                  </button>
                  <button
                    onClick={() => setTimeframe("year")}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${
                      timeframe === "year"
                        ? "bg-blue-500 text-gray-800"
                        : "text-gray-800 hover:bg-white/10"
                    }`}
                  >
                    Year
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sumar Metrici */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {/* Urmăritori */}
            <div className="backdrop-blur-md bg-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Followers</p>
                  <h3 className="text-3xl font-bold text-gray-800 mt-1">
                    {stats.followersSummary.totalFollowers}
                  </h3>
                </div>
                <div className="bg-blue-500/20 p-3 rounded-full">
                  <FaUserFriends className="text-blue-500 h-6 w-6" />
                </div>
              </div>
              <div className="mt-2 text-sm flex justify-between items-center">
                <span className="text-gray-600">
                  {stats.followersSummary.followerRatio > 1
                    ? `${stats.followersSummary.followerRatio}x more followers than you follow`
                    : `You follow ${(
                        1 / stats.followersSummary.followerRatio
                      ).toFixed(1)}x more than follow you`}
                </span>
              </div>
            </div>

            {/* Postări */}
            <div className="backdrop-blur-md bg-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total Posts</p>
                  <h3 className="text-3xl font-bold text-gray-800 mt-1">
                    {stats.postsSummary.totalPosts}
                  </h3>
                </div>
                <div className="bg-purple-500/20 p-3 rounded-full">
                  <FaFire className="text-purple-500 h-6 w-6" />
                </div>
              </div>
              <div className="mt-2 text-sm">
                <span className="text-gray-600">
                  {stats.postsSummary.postsInPeriod} posts in the selected
                  period
                </span>
              </div>
            </div>

            {/* Aprecieri */}
            <div className="backdrop-blur-md bg-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total Likes</p>
                  <h3 className="text-3xl font-bold text-gray-800 mt-1">
                    {stats.postsSummary.engagement.total.likes}
                  </h3>
                </div>
                <div className="bg-pink-500/20 p-3 rounded-full">
                  <FaHeart className="text-pink-500 h-6 w-6" />
                </div>
              </div>
              <div className="mt-2 text-sm">
                <span className="text-gray-600">
                  Average of{" "}
                  {stats.postsSummary.engagement.average.likesPerPost} likes per
                  post
                </span>
              </div>
            </div>

            {/* Comentarii */}
            <div className="backdrop-blur-md bg-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Comments</p>
                  <h3 className="text-3xl font-bold text-gray-800 mt-1">
                    {stats.postsSummary.engagement.total.comments}
                  </h3>
                </div>
                <div className="bg-green-500/20 p-3 rounded-full">
                  <FaComment className="text-green-500 h-6 w-6" />
                </div>
              </div>
              <div className="mt-2 text-sm">
                <span className="text-gray-600">
                  Average of{" "}
                  {stats.postsSummary.engagement.average.commentsPerPost}{" "}
                  comments per post
                </span>
              </div>
            </div>
          </div>

          {/* Secțiunea de grafice principale */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Activitatea postărilor recente */}
            {stats.postEngagement && stats.postEngagement.length > 0 && (
              <div className="backdrop-blur-md bg-white/10 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <FaChartBar className="mr-2 text-blue-400" />
                  Recent Post Activity
                </h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={stats.postEngagement}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                      <XAxis
                        dataKey="date"
                        stroke="#374151"
                        tick={{ fill: "#4B5563" }}
                      />
                      <YAxis stroke="#374151" tick={{ fill: "#4B5563" }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(30, 41, 59, 0.9)",
                          borderColor: "#4B5563",
                          color: "#4B5563",
                        }}
                        itemStyle={{ color: "#4B5563" }}
                        labelStyle={{ color: "#4B5563" }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="likes"
                        stroke="#EC4899"
                        activeDot={{ r: 8 }}
                        name="Likes"
                      />
                      <Line
                        type="monotone"
                        dataKey="comments"
                        stroke="#10B981"
                        name="Comments"
                      />
                      <Line
                        type="monotone"
                        dataKey="saves"
                        stroke="#3B82F6"
                        name="Saves"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Distribuția interacțiunilor */}
            {stats.engagementByType && stats.engagementByType.length > 0 && (
              <div className="backdrop-blur-md bg-white/10 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <FaHeart className="mr-2 text-pink-400" />
                  Engagement Distribution
                </h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.engagementByType}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        innerRadius={40}
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {stats.engagementByType.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(30, 41, 59, 0.9)",
                          borderColor: "#4B5563",
                          color: "#4B5563",
                        }}
                        itemStyle={{ color: "#4B5563" }}
                        labelStyle={{ color: "#4B5563" }}
                        formatter={(value, name) => [value, name]}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>

          {/* Statistici secundare */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Distribuția postărilor după ziua săptămânii */}
            {stats.postsByDay && stats.postsByDay.length > 0 && (
              <div className="backdrop-blur-md bg-white/10 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <FaCalendarAlt className="mr-2 text-yellow-400" />
                  Posts by Day of the Week
                </h2>
                <div className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={stats.postsByDay}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#1F2937"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="day"
                        stroke="#374151"
                        tick={{ fill: "#4B5563" }}
                      />
                      <YAxis stroke="#374151" tick={{ fill: "#4B5563" }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(30, 41, 59, 0.9)",
                          borderColor: "#4B5563",
                          color: "#4B5563",
                        }}
                        itemStyle={{ color: "#4B5563" }}
                        labelStyle={{ color: "#4B5563" }}
                      />
                      <Bar
                        dataKey="count"
                        fill="#F59E0B"
                        barSize={36}
                        radius={[4, 4, 0, 0]}
                        name="Number of Posts"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Cei mai recenți urmăritori */}
            {stats.followersSummary &&
              stats.followersSummary.mostRecentFollowers &&
              stats.followersSummary.mostRecentFollowers.length > 0 && (
                <div className="backdrop-blur-md bg-white/10 rounded-xl p-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <FaUserFriends className="mr-2 text-blue-400" />
                    Most Recent Followers
                  </h2>
                  <div className="space-y-4">
                    {stats.followersSummary.mostRecentFollowers.map(
                      (follower) => (
                        <div
                          key={follower._id}
                          className="flex items-center space-x-3"
                        >
                          <div className="w-10 h-10 bg-gray-300 rounded-full overflow-hidden">
                            {follower.profilePicture ? (
                              <img
                                src={follower.profilePicture}
                                alt={follower.username}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-blue-500 text-white text-lg font-bold">
                                {follower.username.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">
                              @{follower.username}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(follower.followedAt).toLocaleDateString(
                                "ro-RO"
                              )}
                            </p>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
          </div>

          {/* Al treilea rând */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Cele mai populare postări */}
            {stats.topPosts && stats.topPosts.length > 0 && (
              <div className="backdrop-blur-md bg-white/10 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <FaBookmark className="mr-2 text-purple-400" />
                  Most Popular Posts
                </h2>
                <div className="overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-600">
                      <thead className="bg-gray-800/40">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Likes
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Comments
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Saves
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-transparent divide-y divide-gray-700">
                        {stats.topPosts.map((post, index) => (
                          <tr
                            key={post.postId || index.toString()}
                            className="hover:bg-white/5"
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {post.date}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              <span className="flex items-center">
                                <FaHeart className="text-pink-500 mr-2" />
                                {post.likes}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              <span className="flex items-center">
                                <FaComment className="text-green-500 mr-2" />
                                {post.comments}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              <span className="flex items-center">
                                <FaBookmark className="text-blue-500 mr-2" />
                                {post.saves}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Activitate recentă */}
            {stats.recentActivity && stats.recentActivity.length > 0 && (
              <div className="backdrop-blur-md bg-white/10 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <FaRegClock className="mr-2 text-blue-400" />
                  Recent Activity
                </h2>
                <div className="space-y-4 max-h-80 overflow-y-auto">
                  {stats.recentActivity.map((activity, index) => (
                    <div key={index} className="bg-white/5 rounded-lg p-3">
                      <div className="flex items-start">
                        <div className="mr-3">
                          {activity.type === "notification" &&
                            activity.notifType === "like" && (
                              <FaHeart className="text-pink-500 mt-1" />
                            )}
                          {activity.type === "notification" &&
                            activity.notifType === "comment" && (
                              <FaComment className="text-green-500 mt-1" />
                            )}
                          {activity.type === "notification" &&
                            activity.notifType === "follow" && (
                              <FaUserFriends className="text-blue-500 mt-1" />
                            )}
                          {activity.type === "comment" && (
                            <FaComment className="text-purple-500 mt-1" />
                          )}
                        </div>
                        <div>
                          <p className="text-gray-700 text-sm">
                            {activity.type === "notification"
                              ? activity.message
                              : activity.type === "comment"
                              ? activity.text
                              : "Undefined activity"}
                          </p>
                          <p className="text-gray-500 text-xs mt-1">
                            {formatDate(activity.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Secțiunea de Sfaturi */}
          <div className="backdrop-blur-md bg-white/10 rounded-xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Personalized Recommendations
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <h3 className="text-blue-400 font-medium mb-2">
                  Grow Your Audience
                </h3>
                <p className="text-gray-500 text-sm">
                  {getBestDayToPost() ? (
                    <>
                      Post more often on{" "}
                      {getDayNameInRomanian(getBestDayToPost())} when your
                      audience is most active.
                    </>
                  ) : (
                    "Post high-quality content regularly to grow your audience."
                  )}
                </p>
              </div>

              <div className="bg-pink-500/10 border border-pink-500/20 rounded-lg p-4">
                <h3 className="text-pink-400 font-medium mb-2">
                  Optimize Content
                </h3>
                <p className="text-gray-500 text-sm">
                  Posts with the most engagement have an average of{" "}
                  {stats.postsSummary.engagement.average.likesPerPost} likes and{" "}
                  {stats.postsSummary.engagement.average.commentsPerPost}{" "}
                  comments. Use relevant hashtags to increase visibility.
                </p>
              </div>

              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                <h3 className="text-green-400 font-medium mb-2">
                  Increase Engagement
                </h3>
                <p className="text-gray-500 text-sm">
                  Add questions and calls to action in post descriptions to
                  encourage comments. Engage with your followers by responding
                  to comments.
                </p>
              </div>

              <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                <h3 className="text-purple-400 font-medium mb-2">
                  Retain Audience
                </h3>
                <p className="text-gray-500 text-sm">
                  Post consistently to keep your audience engaged. You made{" "}
                  {stats.postsSummary.postsInPeriod} posts in the selected
                  period. Try increasing this frequency for better results.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Dashboard />
    </div>
  );
};

export default StatisticsPage;
