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
  FaEye,
  FaChartBar,
  FaCalendarAlt,
  FaClock,
  FaArrowUp,
  FaArrowDown,
  FaEquals,
} from "react-icons/fa";
import useAuthStore from "../store/AuthStore";
import usePostStore from "../store/PostStore";
import Background from "../components/Home/Background";
import Dashboard from "../components/Home/Dashboard";

// Definim interfețele pentru datele statistice
interface FollowerData {
  date: string;
  followers: number;
  change: number;
}

interface PostEngagementData {
  date: string;
  postId: string;
  likes: number;
  comments: number;
  saves: number;
  total: number;
}

interface PostsByDayData {
  day: string;
  count: number;
}

interface EngagementTypeData {
  name: string;
  value: number;
  color: string;
}

interface ViewsByTimeData {
  time: string;
  views: number;
}

interface CompareItem {
  current: number;
  previous: number;
  change: string;
}

interface CompareStatsData {
  followers: CompareItem;
  likes: CompareItem;
  comments: CompareItem;
  views: CompareItem;
}

interface StatsData {
  followerGrowth: FollowerData[];
  postEngagement: PostEngagementData[];
  postsByDay: PostsByDayData[];
  engagementByType: EngagementTypeData[];
  topPosts: PostEngagementData[];
  viewsByTime: ViewsByTimeData[];
  compareStats: CompareStatsData;
}

type TimeframeType = "week" | "month" | "year";

const StatisticsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { userPosts } = usePostStore();

  const [timeframe, setTimeframe] = useState<TimeframeType>("month");
  const [loading, setLoading] = useState<boolean>(true);
  const [stats, setStats] = useState<StatsData>({
    followerGrowth: [],
    postEngagement: [],
    postsByDay: [],
    engagementByType: [],
    topPosts: [],
    viewsByTime: [],
    compareStats: {
      followers: { current: 0, previous: 0, change: "0" },
      likes: { current: 0, previous: 0, change: "0" },
      comments: { current: 0, previous: 0, change: "0" },
      views: { current: 0, previous: 0, change: "0" },
    },
  });

  // Generăm date mock pentru demonstrație
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    // Simulăm încărcarea datelor
    const timer = setTimeout(() => {
      generateMockData();
      setLoading(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, [user, navigate, timeframe]);

  // Generăm date mock bazate pe perioada selectată
  const generateMockData = () => {
    // Date pentru creșterea numărului de urmăritori
    const followerGrowth: FollowerData[] = [];
    const totalDays =
      timeframe === "week" ? 7 : timeframe === "month" ? 30 : 12;

    let baseFollowers = user?.followers?.length || 0;
    if (baseFollowers === 0) baseFollowers = 120; // Valoare implicită pentru demo

    for (let i = 0; i < totalDays; i++) {
      const date = new Date();
      if (timeframe === "year") {
        date.setMonth(date.getMonth() - (11 - i));
      } else {
        date.setDate(date.getDate() - (totalDays - i - 1));
      }

      const formattedDate =
        timeframe === "year"
          ? date.toLocaleString("default", { month: "short" })
          : `${date.getDate()} ${date.toLocaleString("default", {
              month: "short",
            })}`;

      // Creștere aleatoare cu ocazionale scăderi
      const change =
        Math.floor(Math.random() * 5) - (Math.random() > 0.7 ? 1 : 0);
      baseFollowers += change;

      followerGrowth.push({
        date: formattedDate,
        followers: baseFollowers,
        change: change,
      });
    }

    // Date pentru engagement-ul postărilor
    const postEngagement: PostEngagementData[] = [];
    const totalPosts = userPosts?.length || 10; // Fallback pentru demo

    for (let i = 0; i < totalPosts; i++) {
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 30));

      const formattedDate = `${date.getDate()} ${date.toLocaleString(
        "default",
        { month: "short" }
      )}`;
      const likes = Math.floor(Math.random() * 50) + 5;
      const comments = Math.floor(Math.random() * 10) + 1;
      const saves = Math.floor(Math.random() * 5);

      postEngagement.push({
        date: formattedDate,
        postId: `post_${i}`,
        likes,
        comments,
        saves,
        total: likes + comments + saves,
      });
    }

    // Sortare după dată
    postEngagement.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Postări după ziua săptămânii
    const postsByDay: PostsByDayData[] = [
      { day: "Sun", count: Math.floor(Math.random() * 3) },
      { day: "Mon", count: Math.floor(Math.random() * 5) },
      { day: "Tue", count: Math.floor(Math.random() * 4) + 1 },
      { day: "Wed", count: Math.floor(Math.random() * 6) + 2 },
      { day: "Thu", count: Math.floor(Math.random() * 4) + 1 },
      { day: "Fri", count: Math.floor(Math.random() * 7) + 3 },
      { day: "Sat", count: Math.floor(Math.random() * 5) + 2 },
    ];

    // Engagement după tip
    const likesCount = postEngagement.reduce(
      (sum, post) => sum + post.likes,
      0
    );
    const commentsCount = postEngagement.reduce(
      (sum, post) => sum + post.comments,
      0
    );
    const savesCount = postEngagement.reduce(
      (sum, post) => sum + post.saves,
      0
    );
    const viewsCount = Math.floor(
      (likesCount + commentsCount + savesCount) * 5.2
    ); // Vizualizările sunt de obicei mai multe

    const engagementByType: EngagementTypeData[] = [
      { name: "Likes", value: likesCount, color: "#3B82F6" },
      { name: "Comments", value: commentsCount, color: "#8B5CF6" },
      { name: "Saves", value: savesCount, color: "#10B981" },
      { name: "Views", value: viewsCount, color: "#F59E0B" },
    ];

    // Top postări
    postEngagement.sort((a, b) => b.total - a.total);
    const topPosts = postEngagement.slice(0, 5);

    // Vizualizări după ora zilei
    const viewsByTime: ViewsByTimeData[] = [
      { time: "00:00", views: Math.floor(Math.random() * 10) },
      { time: "03:00", views: Math.floor(Math.random() * 8) },
      { time: "06:00", views: Math.floor(Math.random() * 15) + 5 },
      { time: "09:00", views: Math.floor(Math.random() * 30) + 20 },
      { time: "12:00", views: Math.floor(Math.random() * 40) + 30 },
      { time: "15:00", views: Math.floor(Math.random() * 50) + 40 },
      { time: "18:00", views: Math.floor(Math.random() * 60) + 50 },
      { time: "21:00", views: Math.floor(Math.random() * 40) + 30 },
    ];

    // Comparație cu perioada anterioară
    const prevFollowers = baseFollowers - Math.floor(Math.random() * 20) - 5;
    const prevLikes = likesCount - Math.floor(Math.random() * 30);
    const prevComments = commentsCount - Math.floor(Math.random() * 10);
    const prevViews = viewsCount - Math.floor(Math.random() * 100);

    // Evită diviziunea cu zero
    const calculateChange = (current: number, previous: number): string => {
      if (previous === 0) return "0";
      return (((current - previous) / previous) * 100).toFixed(1);
    };

    const compareStats: CompareStatsData = {
      followers: {
        current: baseFollowers,
        previous: prevFollowers,
        change: calculateChange(baseFollowers, prevFollowers),
      },
      likes: {
        current: likesCount,
        previous: prevLikes,
        change: calculateChange(likesCount, prevLikes),
      },
      comments: {
        current: commentsCount,
        previous: prevComments,
        change: calculateChange(commentsCount, prevComments),
      },
      views: {
        current: viewsCount,
        previous: prevViews,
        change: calculateChange(viewsCount, prevViews),
      },
    };

    setStats({
      followerGrowth,
      postEngagement,
      postsByDay,
      engagementByType,
      topPosts,
      viewsByTime,
      compareStats,
    });
  };

  // Afișăm indicatorul de schimbare pentru compararea statisticilor
  const renderChangeIndicator = (change: string) => {
    const numChange = parseFloat(change);
    if (numChange > 0) {
      return (
        <span className="text-green-500 flex items-center">
          <FaArrowUp className="mr-1" />
          {change}%
        </span>
      );
    } else if (numChange < 0) {
      return (
        <span className="text-red-500 flex items-center">
          <FaArrowDown className="mr-1" />
          {Math.abs(numChange)}%
        </span>
      );
    }
    return (
      <span className="text-gray-500 flex items-center">
        <FaEquals className="mr-1" />
        0%
      </span>
    );
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
              <p className="mt-4 text-lg text-white">
                Loading your statistics...
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
                <h1 className="text-2xl font-bold text-white">
                  Account Statistics
                </h1>
                <p className="text-gray-300 mt-1">
                  Track your growth and engagement
                </p>
              </div>
              <div className="mt-4 md:mt-0">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-1 inline-flex">
                  <button
                    onClick={() => setTimeframe("week")}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${
                      timeframe === "week"
                        ? "bg-blue-500 text-white"
                        : "text-white hover:bg-white/10"
                    }`}
                  >
                    Week
                  </button>
                  <button
                    onClick={() => setTimeframe("month")}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${
                      timeframe === "month"
                        ? "bg-blue-500 text-white"
                        : "text-white hover:bg-white/10"
                    }`}
                  >
                    Month
                  </button>
                  <button
                    onClick={() => setTimeframe("year")}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${
                      timeframe === "year"
                        ? "bg-blue-500 text-white"
                        : "text-white hover:bg-white/10"
                    }`}
                  >
                    Year
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Key Metrics Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {/* Followers */}
            <div className="backdrop-blur-md bg-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Followers</p>
                  <h3 className="text-3xl font-bold text-white mt-1">
                    {stats.compareStats.followers.current}
                  </h3>
                </div>
                <div className="bg-blue-500/20 p-3 rounded-full">
                  <FaUserFriends className="text-blue-500 h-6 w-6" />
                </div>
              </div>
              <div className="mt-2 text-sm">
                {renderChangeIndicator(stats.compareStats.followers.change)}
                <span className="text-gray-300 ml-1">
                  vs previous {timeframe}
                </span>
              </div>
            </div>

            {/* Likes */}
            <div className="backdrop-blur-md bg-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Total Likes</p>
                  <h3 className="text-3xl font-bold text-white mt-1">
                    {stats.compareStats.likes.current}
                  </h3>
                </div>
                <div className="bg-purple-500/20 p-3 rounded-full">
                  <FaHeart className="text-purple-500 h-6 w-6" />
                </div>
              </div>
              <div className="mt-2 text-sm">
                {renderChangeIndicator(stats.compareStats.likes.change)}
                <span className="text-gray-300 ml-1">
                  vs previous {timeframe}
                </span>
              </div>
            </div>

            {/* Comments */}
            <div className="backdrop-blur-md bg-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Comments</p>
                  <h3 className="text-3xl font-bold text-white mt-1">
                    {stats.compareStats.comments.current}
                  </h3>
                </div>
                <div className="bg-green-500/20 p-3 rounded-full">
                  <FaComment className="text-green-500 h-6 w-6" />
                </div>
              </div>
              <div className="mt-2 text-sm">
                {renderChangeIndicator(stats.compareStats.comments.change)}
                <span className="text-gray-300 ml-1">
                  vs previous {timeframe}
                </span>
              </div>
            </div>

            {/* Views */}
            <div className="backdrop-blur-md bg-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Total Views</p>
                  <h3 className="text-3xl font-bold text-white mt-1">
                    {stats.compareStats.views.current}
                  </h3>
                </div>
                <div className="bg-yellow-500/20 p-3 rounded-full">
                  <FaEye className="text-yellow-500 h-6 w-6" />
                </div>
              </div>
              <div className="mt-2 text-sm">
                {renderChangeIndicator(stats.compareStats.views.change)}
                <span className="text-gray-300 ml-1">
                  vs previous {timeframe}
                </span>
              </div>
            </div>
          </div>

          {/* Main Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Follower Growth Chart */}
            <div className="backdrop-blur-md bg-white/10 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                <FaChartBar className="mr-2 text-blue-400" />
                Follower Growth
              </h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={stats.followerGrowth}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="colorFollowers"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#3B82F6"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#3B82F6"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis
                      dataKey="date"
                      stroke="#9CA3AF"
                      tick={{ fill: "#D1D5DB" }}
                    />
                    <YAxis stroke="#9CA3AF" tick={{ fill: "#D1D5DB" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(30, 41, 59, 0.9)",
                        borderColor: "#4B5563",
                        color: "white",
                      }}
                      itemStyle={{ color: "#D1D5DB" }}
                      labelStyle={{ color: "white" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="followers"
                      stroke="#3B82F6"
                      fillOpacity={1}
                      fill="url(#colorFollowers)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Post Engagement Chart */}
            <div className="backdrop-blur-md bg-white/10 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                <FaHeart className="mr-2 text-purple-400" />
                Post Engagement
              </h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={stats.postEngagement}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis
                      dataKey="date"
                      stroke="#9CA3AF"
                      tick={{ fill: "#D1D5DB" }}
                    />
                    <YAxis stroke="#9CA3AF" tick={{ fill: "#D1D5DB" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(30, 41, 59, 0.9)",
                        borderColor: "#4B5563",
                        color: "white",
                      }}
                      itemStyle={{ color: "#D1D5DB" }}
                      labelStyle={{ color: "white" }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="likes"
                      stroke="#3B82F6"
                      activeDot={{ r: 8 }}
                    />
                    <Line type="monotone" dataKey="comments" stroke="#8B5CF6" />
                    <Line type="monotone" dataKey="saves" stroke="#10B981" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Secondary Stats Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Posts by Day of Week */}
            <div className="backdrop-blur-md bg-white/10 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                <FaCalendarAlt className="mr-2 text-yellow-400" />
                Posts by Day of Week
              </h2>
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={stats.postsByDay}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#374151"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="day"
                      stroke="#9CA3AF"
                      tick={{ fill: "#D1D5DB" }}
                    />
                    <YAxis stroke="#9CA3AF" tick={{ fill: "#D1D5DB" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(30, 41, 59, 0.9)",
                        borderColor: "#4B5563",
                        color: "white",
                      }}
                      itemStyle={{ color: "#D1D5DB" }}
                      labelStyle={{ color: "white" }}
                    />
                    <Bar
                      dataKey="count"
                      fill="#F59E0B"
                      barSize={36}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Engagement by Type */}
            <div className="backdrop-blur-md bg-white/10 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                <FaEye className="mr-2 text-green-400" />
                Engagement by Type
              </h2>
              <div className="h-60 flex items-center justify-center">
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
                        color: "white",
                      }}
                      itemStyle={{ color: "#D1D5DB" }}
                      labelStyle={{ color: "white" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Third Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Top Posts */}
            <div className="backdrop-blur-md bg-white/10 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                <FaBookmark className="mr-2 text-purple-400" />
                Top Performing Posts
              </h2>
              <div className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-600">
                    <thead className="bg-gray-800/40">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Likes
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Comments
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
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
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                            {post.date}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                            <span className="flex items-center">
                              <FaHeart className="text-blue-500 mr-2" />
                              {post.likes}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                            <span className="flex items-center">
                              <FaComment className="text-purple-500 mr-2" />
                              {post.comments}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                            <span className="flex items-center">
                              <FaBookmark className="text-green-500 mr-2" />
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

            {/* Best Time to Post */}
            <div className="backdrop-blur-md bg-white/10 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                <FaClock className="mr-2 text-blue-400" />
                Best Time to Post
              </h2>
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={stats.viewsByTime}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="colorViews"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#8B5CF6"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#8B5CF6"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis
                      dataKey="time"
                      stroke="#9CA3AF"
                      tick={{ fill: "#D1D5DB" }}
                    />
                    <YAxis stroke="#9CA3AF" tick={{ fill: "#D1D5DB" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(30, 41, 59, 0.9)",
                        borderColor: "#4B5563",
                        color: "white",
                      }}
                      itemStyle={{ color: "#D1D5DB" }}
                      labelStyle={{ color: "white" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="views"
                      stroke="#8B5CF6"
                      fillOpacity={1}
                      fill="url(#colorViews)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="text-center text-sm text-gray-300 mt-2">
                Optimal posting time:{" "}
                <span className="font-bold text-white">18:00 - 21:00</span>
              </div>
            </div>
          </div>

          {/* Tips Section */}
          <div className="backdrop-blur-md bg-white/10 rounded-xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-white mb-4">
              Personalized Tips
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <h3 className="text-blue-400 font-medium mb-2">
                  Grow your audience
                </h3>
                <p className="text-gray-300 text-sm">
                  Try posting more consistently on Fridays when your engagement
                  is highest.
                </p>
              </div>
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                <h3 className="text-purple-400 font-medium mb-2">
                  Boost engagement
                </h3>
                <p className="text-gray-300 text-sm">
                  Your photos with people get 38% more comments. Consider adding
                  more personal content.
                </p>
              </div>
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                <h3 className="text-green-400 font-medium mb-2">
                  Optimize content
                </h3>
                <p className="text-gray-300 text-sm">
                  Posts with 3-5 hashtags perform better. Try to keep your
                  captions between 70-100 characters.
                </p>
              </div>
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                <h3 className="text-yellow-400 font-medium mb-2">
                  Best time to post
                </h3>
                <p className="text-gray-300 text-sm">
                  Based on your audience's activity, try posting between 6-8pm
                  for maximum reach.
                </p>
              </div>
            </div>
          </div>

          {/* Export Section */}
          <div className="backdrop-blur-md bg-white/10 rounded-xl p-6 mb-8 text-center">
            <h2 className="text-lg font-semibold text-white mb-4">
              Export Your Data
            </h2>
            <p className="text-gray-300 mb-4">
              Download your statistics for personal analysis or reporting
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors">
                Export as PDF
              </button>
              <button className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white font-medium transition-colors">
                Export as CSV
              </button>
              <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium transition-colors">
                Schedule Weekly Report
              </button>
            </div>
          </div>
        </div>
      </div>
      <Dashboard />
    </div>
  );
};

export default StatisticsPage;
