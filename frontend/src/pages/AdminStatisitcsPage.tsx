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
  FaSignInAlt,
  FaExclamationTriangle,
  FaCalendarAlt,
  FaSearchPlus,
} from "react-icons/fa";
import useAuthStore from "../store/AuthStore";
import Background from "../components/Home/Background";
import AdminDashboard from "../components/Home/AdminDashboard";

type TimeframeType = "week" | "month" | "year";

interface StatItem {
  name: string;
  value: number;
  icon: React.ReactNode;
  trend: number;
  color: string;
}

const AdminStatisticsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [timeframe, setTimeframe] = useState<TimeframeType>("month");
  const [loading, setLoading] = useState<boolean>(true);

  // Check if user is admin
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (user.role !== "admin") {
      navigate("/home");
      return;
    }

    // Simulate data loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, [user, navigate]);

  // Generate mock data for the admin dashboard
  const usersData = [
    { date: "Jan", total: 230 },
    { date: "Feb", total: 280 },
    { date: "Mar", total: 340 },
    { date: "Apr", total: 400 },
    { date: "May", total: 470 },
    { date: "Jun", total: 550 },
    { date: "Jul", total: 630 },
    { date: "Aug", total: 730 },
    { date: "Sep", total: 820 },
    { date: "Oct", total: 890 },
    { date: "Nov", total: 950 },
    { date: "Dec", total: 1020 },
  ];

  const postsData = [
    { date: "Jan", total: 120 },
    { date: "Feb", total: 150 },
    { date: "Mar", total: 210 },
    { date: "Apr", total: 290 },
    { date: "May", total: 350 },
    { date: "Jun", total: 410 },
    { date: "Jul", total: 490 },
    { date: "Aug", total: 560 },
    { date: "Sep", total: 610 },
    { date: "Oct", total: 650 },
    { date: "Nov", total: 690 },
    { date: "Dec", total: 720 },
  ];

  const commentsData = [
    { date: "Jan", total: 320 },
    { date: "Feb", total: 380 },
    { date: "Mar", total: 450 },
    { date: "Apr", total: 520 },
    { date: "May", total: 580 },
    { date: "Jun", total: 650 },
    { date: "Jul", total: 720 },
    { date: "Aug", total: 800 },
    { date: "Sep", total: 870 },
    { date: "Oct", total: 930 },
    { date: "Nov", total: 980 },
    { date: "Dec", total: 1050 },
  ];

  const dailyActiveUsersData = [
    { date: "Mon", total: 320 },
    { date: "Tue", total: 380 },
    { date: "Wed", total: 450 },
    { date: "Thu", total: 520 },
    { date: "Fri", total: 580 },
    { date: "Sat", total: 650 },
    { date: "Sun", total: 520 },
  ];

  const usersByCountry = [
    { name: "USA", value: 35 },
    { name: "UK", value: 15 },
    { name: "Canada", value: 10 },
    { name: "Germany", value: 8 },
    { name: "France", value: 7 },
    { name: "Spain", value: 5 },
    { name: "Other", value: 20 },
  ];

  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884D8",
    "#FF6B6B",
    "#A0A0A0",
  ];

  const reportsData = [
    { name: "Inappropriate Content", value: 15 },
    { name: "Spam", value: 30 },
    { name: "Harassment", value: 10 },
    { name: "Fake Account", value: 8 },
    { name: "Other", value: 5 },
  ];

  // Key stats for the top cards
  const keyStats: StatItem[] = [
    {
      name: "Total Users",
      value: 1020,
      icon: <FaUsers className="text-blue-500" />,
      trend: 8.2,
      color: "blue",
    },
    {
      name: "Total Posts",
      value: 720,
      icon: <FaNewspaper className="text-green-500" />,
      trend: 4.1,
      color: "green",
    },
    {
      name: "Total Stories",
      value: 315,
      icon: <FaCamera className="text-purple-500" />,
      trend: 12.3,
      color: "purple",
    },
    {
      name: "Reports",
      value: 68,
      icon: <FaExclamationTriangle className="text-red-500" />,
      trend: -2.5,
      color: "red",
    },
  ];

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
                  Admin Statistics Dashboard
                </h1>
                <p className="text-gray-500 mt-1">
                  Overview of platform metrics and activities
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
            {keyStats.map((stat, index) => (
              <div
                key={index}
                className="backdrop-blur-md bg-white/10 rounded-xl p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">{stat.name}</p>
                    <h3 className="text-3xl font-bold text-gray-800 mt-1">
                      {stat.value.toLocaleString()}
                    </h3>
                  </div>
                  <div className={`bg-${stat.color}-500/20 p-3 rounded-full`}>
                    {React.cloneElement(stat.icon as React.ReactElement, {
                      className: `h-6 w-6`,
                    })}
                  </div>
                </div>
                <div className="mt-2 text-sm">
                  {stat.trend > 0 ? (
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
                      {stat.trend}%
                    </span>
                  ) : (
                    <span className="text-red-500 flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12 13a1 1 0 110 2H7a1 1 0 01-1-1v-5a1 1 0 112 0v2.586l4.293-4.293a1 1 0 011.414 0L16 9.586 20.293 5.293a1 1 0 111.414 1.414l-5 5a1 1 0 01-1.414 0L13 9.414 9.414 13H12z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {Math.abs(stat.trend)}%
                    </span>
                  )}
                  <span className="text-gray-500 ml-1">
                    vs previous {timeframe}
                  </span>
                </div>
              </div>
            ))}
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
                    data={usersData}
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

            {/* Content Growth Chart */}
            <div className="backdrop-blur-md bg-white/10 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <FaNewspaper className="mr-2 text-green-400" />
                Post Growth
              </h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={postsData}
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
            {/* Daily Active Users */}
            <div className="backdrop-blur-md bg-white/10 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <FaCalendarAlt className="mr-2 text-yellow-400" />
                Daily Active Users
              </h2>
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={dailyActiveUsersData}
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
                <FaSearchPlus className="mr-2 text-purple-400" />
                User Distribution by Country
              </h2>
              <div className="h-60 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={usersByCountry}
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
                      {usersByCountry.map((entry, index) => (
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
            {/* Total Comments */}
            <div className="backdrop-blur-md bg-white/10 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <FaComments className="mr-2 text-blue-400" />
                Total Comments
              </h2>
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={commentsData}
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
                    <Line
                      type="monotone"
                      dataKey="total"
                      stroke="#8B5CF6"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

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
                      data={reportsData}
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
                      {reportsData.map((entry, index) => (
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
              Quick Platform Stats
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/30 rounded-lg p-4 backdrop-blur-sm">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-500 text-xs">New Users Today</p>
                    <p className="text-2xl font-bold text-gray-800">24</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <FaSignInAlt className="text-blue-500" />
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-xs text-green-500">+12% from yesterday</p>
                </div>
              </div>

              <div className="bg-white/30 rounded-lg p-4 backdrop-blur-sm">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-500 text-xs">New Posts Today</p>
                    <p className="text-2xl font-bold text-gray-800">38</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <FaNewspaper className="text-green-500" />
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-xs text-green-500">+8% from yesterday</p>
                </div>
              </div>

              <div className="bg-white/30 rounded-lg p-4 backdrop-blur-sm">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-500 text-xs">Active Right Now</p>
                    <p className="text-2xl font-bold text-gray-800">142</p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-full">
                    <FaClock className="text-purple-500" />
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-xs text-green-500">
                    +24% from this time yesterday
                  </p>
                </div>
              </div>
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
                  View Users
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

          {/* Export Options */}
          <div className="backdrop-blur-md bg-white/10 rounded-xl p-6 mb-8 text-center">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              Export Reports
            </h2>
            <p className="text-gray-600 mb-4 text-sm">
              Download statistics reports for records or presentations
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
                Export as PDF
              </button>
              <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors">
                Export as CSV
              </button>
              <button className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors">
                Schedule Weekly Report
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
