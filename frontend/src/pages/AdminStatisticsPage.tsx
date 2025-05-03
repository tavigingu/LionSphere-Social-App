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
  FaUsers,
  FaCamera,
  FaNewspaper,
  FaComments,
  FaClock,
  FaExclamationTriangle,
  FaCalendarAlt,
  FaChartLine,
  FaBell,
  FaHeart,
} from "react-icons/fa";
import useAuthStore from "../store/AuthStore";
import Background from "../components/Home/Background";
import AdminDashboard from "../components/Home/AdminDashboard";
import { getAdminStatistics, TimeframeType } from "../api/StatisticsAdmin";

// Define consistent colors for charts
const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#FF6B6B",
  "#A0A0A0",
];

const AdminStatisticsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [timeframe, setTimeframe] = useState<TimeframeType>("month");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any | null>(null);

  // Check if user is admin and fetch statistics
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (user.role !== "admin") {
      navigate("/home");
      return;
    }

    fetchAdminStatistics();
  }, [user, navigate, timeframe]);

  const fetchAdminStatistics = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log("Fetching admin statistics...");
      const adminStats = await getAdminStatistics(timeframe);
      console.log("Received admin statistics:", adminStats);
      setStats(adminStats);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching admin statistics:", err);
      setError(
        err instanceof Error ? err.message : "Error loading admin statistics"
      );
      setLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="relative min-h-screen">
        <Background />
        <div className="container mx-auto px-4 py-4 relative z-10 lg:pr-96">
          <div className="flex justify-center items-center h-screen">
            <div className="flex flex-col items-center">
              <div className="animate-spin w-12 h-12 border-4 border-t-blue-500 border-blue-200 rounded-full"></div>
              <p className="mt-4 text-lg text-gray-800">
                Loading admin statistics...
              </p>
            </div>
          </div>
        </div>
        <AdminDashboard />
      </div>
    );
  }

  // Error state
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
                onClick={() => fetchAdminStatistics()}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
        <AdminDashboard />
      </div>
    );
  }

  // No data state
  if (!stats) {
    return (
      <div className="relative min-h-screen">
        <Background />
        <div className="container mx-auto px-4 py-4 relative z-10 lg:pr-96">
          <div className="flex justify-center items-center h-screen">
            <div className="flex flex-col items-center">
              <FaExclamationTriangle className="text-yellow-500 text-4xl mb-4" />
              <p className="mt-2 text-xl text-gray-800">
                No statistical data available
              </p>
              <p className="mt-1 text-gray-600">
                There is no data to analyze at the moment.
              </p>
            </div>
          </div>
        </div>
        <AdminDashboard />
      </div>
    );
  }

  // Extract and provide defaults for all required data objects
  const userStats = stats.userStats || {
    totalUsers: 0,
    newUsersToday: 0,
    newUsersThisWeek: 0,
    newUsersThisMonth: 0,
    userGrowth: [{ date: "No data", total: 0 }],
  };

  const postStats = stats.postStats || {
    totalPosts: 0,
    newPostsToday: 0,
    newPostsThisWeek: 0,
    postGrowth: [{ date: "No data", total: 0 }],
    totalLikes: 0,
    totalComments: 0,
    interactionGrowth: [{ date: "No data", likes: 0, comments: 0 }],
  };

  const storyStats = stats.storyStats || {
    totalStories: 0,
    newStoriesToday: 0,
    storyViews: 0,
    storyViewsGrowth: [{ date: "No data", total: 0 }],
  };

  const reportStats = stats.reportStats || {
    totalReports: 0,
    pendingReports: 0,
    reportTypes: [{ name: "No data", value: 100 }],
  };

  const notificationStats = stats.notificationStats || {
    totalNotifications: 0,
    notificationTypes: [{ name: "No data", value: 100 }],
  };

  // Ensure that all arrays have at least one element to prevent chart rendering errors
  if (!userStats.userGrowth || userStats.userGrowth.length === 0) {
    userStats.userGrowth = [{ date: "No data", total: 0 }];
  }

  if (!postStats.postGrowth || postStats.postGrowth.length === 0) {
    postStats.postGrowth = [{ date: "No data", total: 0 }];
  }

  if (
    !postStats.interactionGrowth ||
    postStats.interactionGrowth.length === 0
  ) {
    postStats.interactionGrowth = [{ date: "No data", likes: 0, comments: 0 }];
  }

  if (
    !storyStats.storyViewsGrowth ||
    storyStats.storyViewsGrowth.length === 0
  ) {
    storyStats.storyViewsGrowth = [{ date: "No data", total: 0 }];
  }

  if (!reportStats.reportTypes || reportStats.reportTypes.length === 0) {
    reportStats.reportTypes = [{ name: "No data", value: 100 }];
  }

  if (
    !notificationStats.notificationTypes ||
    notificationStats.notificationTypes.length === 0
  ) {
    notificationStats.notificationTypes = [{ name: "No data", value: 100 }];
  }

  return (
    <div className="relative min-h-screen">
      <Background />
      <div className="container mx-auto px-4 py-4 relative z-10 lg:pr-96">
        <div className="max-w-6xl mx-auto pb-16">
          {/* Header */}
          <div className="backdrop-blur-md bg-white/10 rounded-xl p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Administrative Statistics Dashboard
                </h1>
                <p className="text-gray-500 mt-1">
                  View platform metrics and activity
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

          {/* Key Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {/* Total Users Card */}
            <div className="backdrop-blur-md bg-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total Users</p>
                  <h3 className="text-3xl font-bold text-gray-800 mt-1">
                    {userStats.totalUsers.toLocaleString()}
                  </h3>
                </div>
                <div className="bg-blue-500/20 p-3 rounded-full">
                  <FaUsers className="text-blue-500 h-6 w-6" />
                </div>
              </div>
              <div className="mt-2 text-sm">
                <span className="text-green-500 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z"
                      clipRule="evenodd"
                    />
                  </svg>
                  +{userStats.newUsersThisWeek}
                </span>
                <span className="text-gray-500 ml-1">this {timeframe}</span>
              </div>
            </div>

            {/* Total Posts Card */}
            <div className="backdrop-blur-md bg-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total Posts</p>
                  <h3 className="text-3xl font-bold text-gray-800 mt-1">
                    {postStats.totalPosts.toLocaleString()}
                  </h3>
                </div>
                <div className="bg-green-500/20 p-3 rounded-full">
                  <FaNewspaper className="text-green-500 h-6 w-6" />
                </div>
              </div>
              <div className="mt-2 text-sm">
                <span className="text-green-500 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z"
                      clipRule="evenodd"
                    />
                  </svg>
                  +{postStats.newPostsThisWeek}
                </span>
                <span className="text-gray-500 ml-1">this {timeframe}</span>
              </div>
            </div>

            {/* Total Stories Card */}
            <div className="backdrop-blur-md bg-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total Stories</p>
                  <h3 className="text-3xl font-bold text-gray-800 mt-1">
                    {storyStats.totalStories.toLocaleString()}
                  </h3>
                </div>
                <div className="bg-purple-500/20 p-3 rounded-full">
                  <FaCamera className="text-purple-500 h-6 w-6" />
                </div>
              </div>
              <div className="mt-2 text-sm">
                <span className="text-green-500 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {storyStats.newStoriesToday}
                </span>
                <span className="text-gray-500 ml-1">today</span>
              </div>
            </div>

            {/* Reports Card */}
            <div className="backdrop-blur-md bg-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Reports</p>
                  <h3 className="text-3xl font-bold text-gray-800 mt-1">
                    {reportStats.totalReports.toLocaleString()}
                  </h3>
                </div>
                <div className="bg-red-500/20 p-3 rounded-full">
                  <FaExclamationTriangle className="text-red-500 h-6 w-6" />
                </div>
              </div>
              <div className="mt-2 text-sm">
                <span className="text-red-500 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {reportStats.pendingReports}
                </span>
                <span className="text-gray-500 ml-1">pending</span>
              </div>
            </div>
          </div>

          {/* Charts Section - First Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* User Growth Chart */}
            <div className="backdrop-blur-md bg-white/10 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <FaUsers className="mr-2 text-blue-400" />
                User Growth
              </h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={userStats.userGrowth}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="colorUsers"
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
                    <Area
                      type="monotone"
                      dataKey="total"
                      stroke="#3B82F6"
                      fillOpacity={1}
                      fill="url(#colorUsers)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Post Growth Chart */}
            <div className="backdrop-blur-md bg-white/10 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <FaNewspaper className="mr-2 text-green-400" />
                Post Growth
              </h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={postStats.postGrowth}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="colorPosts"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#10B981"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#10B981"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
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
                    <Area
                      type="monotone"
                      dataKey="total"
                      stroke="#10B981"
                      fillOpacity={1}
                      fill="url(#colorPosts)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Charts Section - Second Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Report Types */}
            <div className="backdrop-blur-md bg-white/10 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <FaExclamationTriangle className="mr-2 text-red-400" />
                Report Types
              </h2>
              <div className="h-60 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={reportStats.reportTypes}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {reportStats.reportTypes.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
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
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Charts Section - Third Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Interaction Growth */}
            <div className="backdrop-blur-md bg-white/10 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <FaHeart className="mr-2 text-pink-400" />
                User Interactions
              </h2>
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={postStats.interactionGrowth}
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
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 8 }}
                      name="Likes"
                    />
                    <Line
                      type="monotone"
                      dataKey="comments"
                      stroke="#8B5CF6"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      name="Comments"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Notification Types */}
            <div className="backdrop-blur-md bg-white/10 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <FaBell className="mr-2 text-yellow-400" />
                Notification Distribution
              </h2>
              <div className="h-60 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={notificationStats.notificationTypes}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {notificationStats.notificationTypes.map(
                        (entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        )
                      )}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(30, 41, 59, 0.9)",
                        borderColor: "#4B5563",
                        color: "#4B5563",
                      }}
                      itemStyle={{ color: "#4B5563" }}
                      labelStyle={{ color: "#4B5563" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Story Views Growth */}
          <div className="backdrop-blur-md bg-white/10 rounded-xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FaCamera className="mr-2 text-purple-400" />
              Story Views
            </h2>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={storyStats.storyViewsGrowth}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="colorStoryViews"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
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
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#8B5CF6"
                    fillOpacity={1}
                    fill="url(#colorStoryViews)"
                    name="Views"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Stats Section */}
          <div className="backdrop-blur-md bg-white/10 rounded-xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Quick Platform Stats
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/30 rounded-lg p-4 backdrop-blur-sm">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-500 text-xs">New Users Today</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {userStats.newUsersToday}
                    </p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <FaUsers className="text-blue-500" />
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-xs text-green-500">
                    +
                    {userStats.totalUsers > 0
                      ? Math.round(
                          (userStats.newUsersToday / userStats.totalUsers) * 100
                        )
                      : 0}
                    % of total
                  </p>
                </div>
              </div>

              <div className="bg-white/30 rounded-lg p-4 backdrop-blur-sm">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-500 text-xs">New Posts Today</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {postStats.newPostsToday}
                    </p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <FaNewspaper className="text-green-500" />
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-xs text-green-500">
                    +
                    {postStats.totalPosts > 0
                      ? Math.round(
                          (postStats.newPostsToday / postStats.totalPosts) * 100
                        )
                      : 0}
                    % of total
                  </p>
                </div>
              </div>

              <div className="bg-white/30 rounded-lg p-4 backdrop-blur-sm">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-500 text-xs">Story Views</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {storyStats.storyViews}
                    </p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-full">
                    <FaClock className="text-purple-500" />
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-xs text-green-500">
                    Average of{" "}
                    {storyStats.totalStories > 0
                      ? Math.round(
                          storyStats.storyViews / storyStats.totalStories
                        )
                      : 0}{" "}
                    views/story
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Monthly Top Metrics */}
          <div className="backdrop-blur-md bg-white/10 rounded-xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FaChartLine className="mr-2 text-blue-400" />
              Monthly Top Metrics
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-300">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Metric
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Daily Average
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trend
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-300 bg-white/5">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
                      <div className="flex items-center">
                        <FaUsers className="text-blue-500 mr-2" />
                        New Users
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {userStats.newUsersThisMonth}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {Math.round(userStats.newUsersThisMonth / 30)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <svg
                          className="-ml-0.5 mr-1.5 h-2 w-2 text-green-400"
                          fill="currentColor"
                          viewBox="0 0 8 8"
                        >
                          <circle cx="4" cy="4" r="3" />
                        </svg>
                        Increasing
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
                      <div className="flex items-center">
                        <FaNewspaper className="text-green-500 mr-2" />
                        New Posts
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {postStats.newPostsThisWeek * 4}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {Math.round((postStats.newPostsThisWeek * 4) / 30)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <svg
                          className="-ml-0.5 mr-1.5 h-2 w-2 text-green-400"
                          fill="currentColor"
                          viewBox="0 0 8 8"
                        >
                          <circle cx="4" cy="4" r="3" />
                        </svg>
                        Increasing
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
                      <div className="flex items-center">
                        <FaHeart className="text-pink-500 mr-2" />
                        Likes
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {Math.round(postStats.totalLikes / 12)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {Math.round(postStats.totalLikes / 12 / 30)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <svg
                          className="-ml-0.5 mr-1.5 h-2 w-2 text-green-400"
                          fill="currentColor"
                          viewBox="0 0 8 8"
                        >
                          <circle cx="4" cy="4" r="3" />
                        </svg>
                        Increasing
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
                      <div className="flex items-center">
                        <FaComments className="text-indigo-500 mr-2" />
                        Comments
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {Math.round(postStats.totalComments / 12)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {Math.round(postStats.totalComments / 12 / 30)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <svg
                          className="-ml-0.5 mr-1.5 h-2 w-2 text-green-400"
                          fill="currentColor"
                          viewBox="0 0 8 8"
                        >
                          <circle cx="4" cy="4" r="3" />
                        </svg>
                        Increasing
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
                      <div className="flex items-center">
                        <FaExclamationTriangle className="text-red-500 mr-2" />
                        Reports
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {Math.round(reportStats.totalReports / 12)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {Math.round(reportStats.totalReports / 12 / 30)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <svg
                          className="-ml-0.5 mr-1.5 h-2 w-2 text-red-400"
                          fill="currentColor"
                          viewBox="0 0 8 8"
                        >
                          <circle cx="4" cy="4" r="3" />
                        </svg>
                        Increasing
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Actions Section */}
          <div className="backdrop-blur-md bg-white/10 rounded-xl p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Administrative Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-500 bg-opacity-10 border border-blue-300 rounded-lg p-4">
                <h3 className="text-blue-600 font-medium mb-2 flex items-center">
                  <FaUsers className="mr-2" /> User Management
                </h3>
                <p className="text-gray-600 text-sm mb-3">
                  Manage user accounts, roles, and permissions
                </p>
                <button
                  onClick={() => navigate("/admin/users")}
                  className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 transition-colors"
                >
                  Manage Users
                </button>
              </div>

              <div className="bg-red-500 bg-opacity-10 border border-red-300 rounded-lg p-4">
                <h3 className="text-red-600 font-medium mb-2 flex items-center">
                  <FaExclamationTriangle className="mr-2" /> Content Reports
                </h3>
                <p className="text-gray-600 text-sm mb-3">
                  Review and manage reported content
                </p>
                <button
                  onClick={() => navigate("/admin/reports")}
                  className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700 transition-colors"
                >
                  View Reports
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <AdminDashboard />
    </div>
  );
};

export default AdminStatisticsPage;
