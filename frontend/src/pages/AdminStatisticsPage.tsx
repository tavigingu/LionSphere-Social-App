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
  FaGlobe,
  FaChartLine,
  FaBell,
  FaHeart,
  FaUser,
} from "react-icons/fa";
import useAuthStore from "../store/AuthStore";
import Background from "../components/Home/Background";
import AdminDashboard from "../components/Home/AdminDashboard";
import {
  getAdminStatistics,
  AdminStats,
  TimeframeType,
} from "../api/StatisticsAdmin";

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
  const [stats, setStats] = useState<AdminStats | null>(null);

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
        err instanceof Error
          ? err.message
          : "Eroare la încărcarea statisticilor admin"
      );
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="relative min-h-screen">
        <Background />
        <div className="container mx-auto px-4 py-4 relative z-10 lg:pr-96">
          <div className="flex justify-center items-center h-screen">
            <div className="flex flex-col items-center">
              <div className="animate-spin w-12 h-12 border-4 border-t-blue-500 border-blue-200 rounded-full"></div>
              <p className="mt-4 text-lg text-gray-800">
                Încărcare statistici admin...
              </p>
            </div>
          </div>
        </div>
        <AdminDashboard />
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative min-h-screen">
        <Background />
        <div className="container mx-auto px-4 py-4 relative z-10 lg:pr-96">
          <div className="flex justify-center items-center h-screen">
            <div className="flex flex-col items-center">
              <FaExclamationTriangle className="text-yellow-500 text-4xl mb-4" />
              <p className="mt-2 text-xl text-gray-800">
                Eroare la încărcarea statisticilor
              </p>
              <p className="mt-1 text-gray-600">{error}</p>
              <button
                onClick={() => fetchAdminStatistics()}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                Încearcă din nou
              </button>
            </div>
          </div>
        </div>
        <AdminDashboard />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="relative min-h-screen">
        <Background />
        <div className="container mx-auto px-4 py-4 relative z-10 lg:pr-96">
          <div className="flex justify-center items-center h-screen">
            <div className="flex flex-col items-center">
              <FaExclamationTriangle className="text-yellow-500 text-4xl mb-4" />
              <p className="mt-2 text-xl text-gray-800">
                Nu există date statistice disponibile
              </p>
              <p className="mt-1 text-gray-600">
                Nu există date de analizat în acest moment.
              </p>
            </div>
          </div>
        </div>
        <AdminDashboard />
      </div>
    );
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
                  Panou statistici administrative
                </h1>
                <p className="text-gray-500 mt-1">
                  Vizualizare metrici și activitate platformă
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
                    Săptămână
                  </button>
                  <button
                    onClick={() => setTimeframe("month")}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${
                      timeframe === "month"
                        ? "bg-blue-500 text-gray-800"
                        : "text-gray-800 hover:bg-white/10"
                    }`}
                  >
                    Lună
                  </button>
                  <button
                    onClick={() => setTimeframe("year")}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${
                      timeframe === "year"
                        ? "bg-blue-500 text-gray-800"
                        : "text-gray-800 hover:bg-white/10"
                    }`}
                  >
                    An
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
                  <p className="text-gray-500 text-sm">Total utilizatori</p>
                  <h3 className="text-3xl font-bold text-gray-800 mt-1">
                    {stats.userStats.totalUsers.toLocaleString()}
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
                  +{stats.userStats.newUsersThisWeek}
                </span>
                <span className="text-gray-500 ml-1">
                  în această{" "}
                  {timeframe === "week"
                    ? "săptămână"
                    : timeframe === "month"
                    ? "lună"
                    : "an"}
                </span>
              </div>
            </div>

            {/* Total Posts Card */}
            <div className="backdrop-blur-md bg-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total postări</p>
                  <h3 className="text-3xl font-bold text-gray-800 mt-1">
                    {stats.postStats.totalPosts.toLocaleString()}
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
                  +{stats.postStats.newPostsThisWeek}
                </span>
                <span className="text-gray-500 ml-1">
                  în această{" "}
                  {timeframe === "săptămână"
                    ? "week"
                    : timeframe === "month"
                    ? "lună"
                    : "an"}
                </span>
              </div>
            </div>

            {/* Total Stories Card */}
            <div className="backdrop-blur-md bg-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total stories</p>
                  <h3 className="text-3xl font-bold text-gray-800 mt-1">
                    {stats.storyStats.totalStories.toLocaleString()}
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
                  {stats.storyStats.newStoriesToday}
                </span>
                <span className="text-gray-500 ml-1">astăzi</span>
              </div>
            </div>

            {/* Reports Card */}
            <div className="backdrop-blur-md bg-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Raportări</p>
                  <h3 className="text-3xl font-bold text-gray-800 mt-1">
                    {stats.reportStats.totalReports.toLocaleString()}
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
                  {stats.reportStats.pendingReports}
                </span>
                <span className="text-gray-500 ml-1">în așteptare</span>
              </div>
            </div>
          </div>

          {/* Charts Section - First Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* User Growth Chart */}
            <div className="backdrop-blur-md bg-white/10 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <FaUsers className="mr-2 text-blue-400" />
                Creștere utilizatori
              </h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={stats.userStats.userGrowth}
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
                Creștere postări
              </h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={stats.postStats.postGrowth}
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
            {/* User Activity by Day */}
            <div className="backdrop-blur-md bg-white/10 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <FaCalendarAlt className="mr-2 text-yellow-400" />
                Utilizatori activi zilnic
              </h2>
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={stats.userStats.dailyActiveUsers}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#1F2937"
                      vertical={false}
                    />
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
                    <Bar
                      dataKey="total"
                      fill="#F59E0B"
                      barSize={36}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* User Distribution by Country */}
            <div className="backdrop-blur-md bg-white/10 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <FaGlobe className="mr-2 text-purple-400" />
                Distribuția utilizatorilor după țară
              </h2>
              <div className="h-60 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.userStats.usersByCountry}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {stats.userStats.usersByCountry.map((entry, index) => (
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
                Interacțiuni utilizatori
              </h2>
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={stats.postStats.interactionGrowth}
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
                      name="Aprecieri"
                    />
                    <Line
                      type="monotone"
                      dataKey="comments"
                      stroke="#8B5CF6"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      name="Comentarii"
                    />
                    <Line
                      type="monotone"
                      dataKey="shares"
                      stroke="#10B981"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      name="Distribuiri"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Report Types */}
            <div className="backdrop-blur-md bg-white/10 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <FaExclamationTriangle className="mr-2 text-red-400" />
                Tipuri de raportări
              </h2>
              <div className="h-60 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.reportStats.reportTypes}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {stats.reportStats.reportTypes.map((entry, index) => (
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

          {/* Quick Stats Section */}
          <div className="backdrop-blur-md bg-white/10 rounded-xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Statistici rapide platformă
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/30 rounded-lg p-4 backdrop-blur-sm">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-500 text-xs">
                      Utilizatori noi astăzi
                    </p>
                    <p className="text-2xl font-bold text-gray-800">
                      {stats.userStats.newUsersToday}
                    </p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <FaUser className="text-blue-500" />
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-xs text-green-500">
                    +
                    {Math.round(
                      (stats.userStats.newUsersToday /
                        stats.userStats.totalUsers) *
                        100
                    )}
                    % din total
                  </p>
                </div>
              </div>

              <div className="bg-white/30 rounded-lg p-4 backdrop-blur-sm">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-500 text-xs">Postări noi astăzi</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {stats.postStats.newPostsToday}
                    </p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <FaNewspaper className="text-green-500" />
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-xs text-green-500">
                    +
                    {Math.round(
                      (stats.postStats.newPostsToday /
                        stats.postStats.totalPosts) *
                        100
                    )}
                    % din total
                  </p>
                </div>
              </div>

              <div className="bg-white/30 rounded-lg p-4 backdrop-blur-sm">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-500 text-xs">Vizualizări stories</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {stats.storyStats.storyViews}
                    </p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-full">
                    <FaClock className="text-purple-500" />
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-xs text-green-500">
                    Media de{" "}
                    {Math.round(
                      stats.storyStats.storyViews /
                        stats.storyStats.totalStories
                    )}{" "}
                    vizualizări/story
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Monthly Top Metrics */}
          <div className="backdrop-blur-md bg-white/10 rounded-xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FaChartLine className="mr-2 text-blue-400" />
              Metrici lunare principale
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
                      Media zilnică
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tendință
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-300 bg-white/5">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
                      <div className="flex items-center">
                        <FaUsers className="text-blue-500 mr-2" />
                        Utilizatori noi
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {stats.userStats.newUsersThisMonth}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {Math.round(stats.userStats.newUsersThisMonth / 30)}
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
                        Crește
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
                      <div className="flex items-center">
                        <FaNewspaper className="text-green-500 mr-2" />
                        Postări noi
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {stats.postStats.newPostsThisWeek * 4}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {Math.round((stats.postStats.newPostsThisWeek * 4) / 30)}
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
                        Crește
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
                      <div className="flex items-center">
                        <FaHeart className="text-pink-500 mr-2" />
                        Aprecieri
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {Math.round(stats.postStats.totalLikes / 12)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {Math.round(stats.postStats.totalLikes / 12 / 30)}
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
                        Crește
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
                      <div className="flex items-center">
                        <FaComments className="text-indigo-500 mr-2" />
                        Comentarii
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {Math.round(stats.postStats.totalComments / 12)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {Math.round(stats.postStats.totalComments / 12 / 30)}
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
                        Crește
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
                      <div className="flex items-center">
                        <FaExclamationTriangle className="text-red-500 mr-2" />
                        Raportări
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {Math.round(stats.reportStats.totalReports / 12)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {Math.round(stats.reportStats.totalReports / 12 / 30)}
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
                        Crește
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
              Acțiuni administrative
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-500 bg-opacity-10 border border-blue-300 rounded-lg p-4">
                <h3 className="text-blue-600 font-medium mb-2 flex items-center">
                  <FaUsers className="mr-2" /> Gestiune utilizatori
                </h3>
                <p className="text-gray-600 text-sm mb-3">
                  Administrează conturile utilizatorilor, rolurile și
                  permisiunile
                </p>
                <button
                  onClick={() => navigate("/admin/users")}
                  className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 transition-colors"
                >
                  Gestionează utilizatori
                </button>
              </div>

              <div className="bg-red-500 bg-opacity-10 border border-red-300 rounded-lg p-4">
                <h3 className="text-red-600 font-medium mb-2 flex items-center">
                  <FaExclamationTriangle className="mr-2" /> Raportări conținut
                </h3>
                <p className="text-gray-600 text-sm mb-3">
                  Revizuiește și gestionează conținutul raportat
                </p>
                <button
                  onClick={() => navigate("/admin/reports")}
                  className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700 transition-colors"
                >
                  Vezi raportări
                </button>
              </div>
            </div>
          </div>

          {/* Notification Types */}
          <div className="backdrop-blur-md bg-white/10 rounded-xl p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FaBell className="mr-2 text-yellow-400" />
              Distribuția notificărilor
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.notificationStats.notificationTypes}
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label
                      >
                        {stats.notificationStats.notificationTypes.map(
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
              <div className="flex flex-col justify-center">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      Total notificări
                    </h3>
                    <p className="text-3xl font-bold text-gray-800">
                      {stats.notificationStats.totalNotifications.toLocaleString()}
                    </p>
                  </div>
                  <div className="space-y-2">
                    {stats.notificationStats.notificationTypes.map(
                      (type, index) => (
                        <div key={index} className="flex items-center">
                          <div
                            className="w-3 h-3 rounded-full mr-2"
                            style={{
                              backgroundColor: COLORS[index % COLORS.length],
                            }}
                          ></div>
                          <div className="text-sm text-gray-700">
                            {type.name}: {type.value}%
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Post Types */}
          <div className="backdrop-blur-md bg-white/10 rounded-xl p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Distribuția tipurilor de postări
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {stats.postStats.postTypes.map((type, index) => (
                <div
                  key={index}
                  className={`bg-${COLORS[index % COLORS.length].replace(
                    "#",
                    ""
                  )}/10 border border-${COLORS[index % COLORS.length].replace(
                    "#",
                    ""
                  )}/30 rounded-lg p-4`}
                >
                  <h3
                    className="font-medium mb-2"
                    style={{ color: COLORS[index % COLORS.length] }}
                  >
                    {type.name}
                  </h3>
                  <div className="flex items-end justify-between">
                    <p className="text-2xl font-bold text-gray-800">
                      {type.value}%
                    </p>
                    <div className="w-24 h-6 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${type.value}%`,
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Export Options */}
          <div className="backdrop-blur-md bg-white/10 rounded-xl p-6 mb-8 text-center">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              Exportă rapoarte
            </h2>
            <p className="text-gray-600 mb-4 text-sm">
              Descarcă rapoarte statistice pentru evidență sau prezentări
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
                Exportă ca PDF
              </button>
              <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors">
                Exportă ca CSV
              </button>
              <button className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors">
                Programează raport săptămânal
              </button>
            </div>
          </div>
        </div>
      </div>
      <AdminDashboard />
    </div>
  );
};

export default AdminStatisticsPage;
