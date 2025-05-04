import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaExclamationTriangle,
  FaSearch,
  FaFilter,
  FaEye,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglass,
  FaTrash,
  FaFlag,
  FaUser,
} from "react-icons/fa";
import axios from "axios";
import useAuthStore from "../store/AuthStore";
import Background from "../components/Home/Background";
import AdminDashboard from "../components/Home/AdminDashboard";
import api from "../api/axiosConfig";

interface ReportedPost {
  _id: string;
  userId: string;
  itemId: string;
  postUserId: string;
  reason: string;
  text?: string;
  status: "pending" | "reviewed" | "resolved" | "dismissed";
  createdAt: string;
  reporter: {
    username: string;
    profilePicture?: string;
  };
  reportedPost: {
    desc: string;
    image?: string;
    userId: string;
  };
  postOwner: {
    username: string;
    profilePicture?: string;
  };
}

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  reviewed: "bg-blue-100 text-blue-800",
  resolved: "bg-green-100 text-green-800",
  dismissed: "bg-gray-100 text-gray-800",
};

const reasonIcons = {
  inappropriate: <FaExclamationTriangle className="text-red-500" />,
  spam: <FaFlag className="text-blue-500" />,
  harassment: <FaFlag className="text-orange-500" />,
  violence: <FaFlag className="text-red-600" />,
  fake: <FaFlag className="text-purple-500" />,
  intellectual: <FaFlag className="text-yellow-500" />,
  other: <FaFlag className="text-gray-500" />,
};

const AdminReportedPostsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [reportedPosts, setReportedPosts] = useState<ReportedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("pending");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeReport, setActiveReport] = useState<ReportedPost | null>(null);
  const [reportActionLoading, setReportActionLoading] = useState(false);
  const [deletePostLoading, setDeletePostLoading] = useState(false);

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

    fetchReportedPosts();
  }, [user, navigate, filterStatus, currentPage]);

  const fetchReportedPosts = async () => {
    setLoading(true);
    try {
      let endpoint = `/report/posts?page=${currentPage}&limit=10`;

      if (filterStatus !== "all") {
        endpoint += `&status=${filterStatus}`;
      }

      const response = await api.get(endpoint);

      if (response.data.success) {
        setReportedPosts(response.data.reportedPosts);
        setTotalPages(response.data.pagination.totalPages);
      } else {
        setError("Failed to fetch reported posts");
      }
    } catch (err) {
      console.error("Error fetching reported posts:", err);
      setError("Error fetching reported posts");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (reportId: string, newStatus: string) => {
    if (reportActionLoading) return;

    setReportActionLoading(true);
    try {
      const response = await axios.put(
        `http://localhost:5001/report/${reportId}`,
        {
          status: newStatus,
          adminNote: `Status updated by ${
            user?.username
          } on ${new Date().toLocaleDateString()}`,
        }
      );

      if (response.data.success) {
        setReportedPosts((prev) =>
          prev.map((report) =>
            report._id === reportId
              ? {
                  ...report,
                  status: newStatus as
                    | "pending"
                    | "reviewed"
                    | "resolved"
                    | "dismissed",
                }
              : report
          )
        );

        setActiveReport((prev) =>
          prev && prev._id === reportId
            ? {
                ...prev,
                status: newStatus as
                  | "pending"
                  | "reviewed"
                  | "resolved"
                  | "dismissed",
              }
            : prev
        );
      }
    } catch (err) {
      console.error("Error updating report status:", err);
    } finally {
      setReportActionLoading(false);
    }
  };

  const handleDeletePost = async (postId: string, reportId: string) => {
    if (deletePostLoading) return;

    if (
      !window.confirm(
        "Are you sure you want to delete this post? This action cannot be undone."
      )
    ) {
      return;
    }

    setDeletePostLoading(true);
    try {
      // Delete the post
      const response = await axios.delete(
        `http://localhost:5001/post/${postId}`
      );

      if (response.data.success) {
        // Mark the report as resolved
        await handleUpdateStatus(reportId, "resolved");

        // Remove the post from the list
        setReportedPosts((prev) =>
          prev.filter((post) => post.itemId !== postId)
        );

        // Clear active report if it's the deleted post
        if (activeReport?.itemId === postId) {
          setActiveReport(null);
        }
      } else {
        alert("Failed to delete post: " + response.data.message);
      }
    } catch (err) {
      console.error("Error deleting post:", err);
      alert("Error deleting post. Please try again.");
    } finally {
      setDeletePostLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  if (loading && reportedPosts.length === 0) {
    return (
      <div className="relative min-h-screen">
        <Background />
        <div className="container mx-auto px-4 py-4 relative z-10 lg:pr-96">
          <div className="flex justify-center items-center h-screen">
            <div className="flex flex-col items-center">
              <div className="animate-spin w-12 h-12 border-4 border-t-blue-500 border-blue-200 rounded-full"></div>
              <p className="mt-4 text-lg text-gray-800">
                Loading reported posts...
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
          <div className="backdrop-blur-md bg-white/80 rounded-xl p-6 mb-6 shadow-lg">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Reported Posts
                </h1>
                <p className="text-gray-500 mt-1">
                  Review and moderate posts that users have flagged as
                  inappropriate
                </p>
              </div>

              {/* Filter */}
              <div className="mt-4 md:mt-0">
                <div className="relative">
                  <select
                    value={filterStatus}
                    onChange={(e) => {
                      setFilterStatus(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-10 pr-4 py-2 bg-white/90 backdrop-blur-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="resolved">Resolved</option>
                    <option value="dismissed">Dismissed</option>
                  </select>
                  <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 flex items-center justify-between">
              <span>{error}</span>
              <button onClick={() => setError(null)} className="text-red-700">
                <FaTimesCircle />
              </button>
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Reported Posts Grid */}
            <div className="backdrop-blur-md bg-white/80 rounded-xl overflow-hidden shadow-lg lg:flex-1">
              <div className="bg-gray-100 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="font-semibold text-gray-800">
                  Reported Posts ({reportedPosts.length})
                </h2>
                <div className="text-sm text-gray-500">
                  Displaying page {currentPage} of {totalPages}
                </div>
              </div>

              {reportedPosts.length === 0 ? (
                <div className="p-6 text-center">
                  <div className="bg-gray-100 rounded-lg p-8 max-w-md mx-auto">
                    <FaExclamationTriangle className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">
                      No reported posts found
                    </h3>
                    <p className="text-gray-500">
                      {filterStatus !== "all"
                        ? `No posts with status "${filterStatus}" found.`
                        : "There are no reported posts in the system."}
                    </p>
                    {filterStatus !== "all" && (
                      <button
                        onClick={() => setFilterStatus("all")}
                        className="mt-4 px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                      >
                        Show all posts
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                  {reportedPosts.map((report) => (
                    <div
                      key={report._id}
                      className={`bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer border-2 transition-colors ${
                        activeReport?._id === report._id
                          ? "border-blue-500"
                          : "border-transparent hover:border-blue-200"
                      }`}
                      onClick={() => setActiveReport(report)}
                    >
                      <div className="relative">
                        {report.reportedPost?.image ? (
                          <img
                            src={report.reportedPost.image}
                            alt="Post"
                            className="w-full h-48 object-cover"
                          />
                        ) : (
                          <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-400">No image</span>
                          </div>
                        )}
                        <span
                          className={`absolute top-2 right-2 px-2 py-1 text-xs font-semibold rounded-full ${
                            statusColors[report.status]
                          }`}
                        >
                          {report.status}
                        </span>
                      </div>

                      <div className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div
                            className="flex items-center cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/profile/${report.postUserId}`);
                            }}
                          >
                            <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-200">
                              {report.postOwner?.profilePicture ? (
                                <img
                                  src={report.postOwner.profilePicture}
                                  alt={report.postOwner.username}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center bg-blue-500 text-white">
                                  {report.postOwner?.username
                                    .charAt(0)
                                    .toUpperCase() || "?"}
                                </div>
                              )}
                            </div>
                            <div className="ml-2">
                              <span className="text-sm font-medium hover:text-blue-600">
                                {report.postOwner?.username}
                              </span>
                              <div className="text-xs text-gray-500">
                                {formatDate(report.createdAt)}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center">
                            <div className="flex items-center bg-red-50 px-2 py-1 rounded text-xs">
                              {reasonIcons[
                                report.reason as keyof typeof reasonIcons
                              ] || reasonIcons.other}
                              <span className="ml-1 text-gray-700 capitalize">
                                {report.reason}
                              </span>
                            </div>
                          </div>
                        </div>

                        <p className="text-gray-800 text-sm line-clamp-2 mb-2">
                          {report.reportedPost?.desc || "No description"}
                        </p>

                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <div className="flex items-center text-xs text-gray-500">
                            <span className="mr-2">Reported by:</span>
                            <div className="h-5 w-5 rounded-full overflow-hidden bg-gray-200 mr-1">
                              {report.reporter?.profilePicture ? (
                                <img
                                  src={report.reporter.profilePicture}
                                  alt={report.reporter.username}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center bg-purple-500 text-white text-xs">
                                  {report.reporter?.username
                                    .charAt(0)
                                    .toUpperCase() || "?"}
                                </div>
                              )}
                            </div>
                            <span>{report.reporter?.username}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded ${
                      currentPage === 1
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                    }`}
                  >
                    Previous
                  </button>
                  <div className="text-sm text-gray-500">
                    Page {currentPage} of {totalPages}
                  </div>
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded ${
                      currentPage === totalPages
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                    }`}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>

            {/* Report details panel */}
            <div className="backdrop-blur-md bg-white/80 rounded-xl shadow-lg lg:w-2/5">
              <div className="bg-gray-100 px-6 py-4 border-b border-gray-200">
                <h2 className="font-semibold text-gray-800">
                  Post Report Details
                </h2>
              </div>

              {activeReport ? (
                <div className="p-6">
                  <div className="mb-6 pb-6 border-b border-gray-200">
                    {/* Post Owner Info (clickable) */}
                    <div className="flex items-center mb-4">
                      <div
                        className="h-12 w-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 cursor-pointer"
                        onClick={() =>
                          navigate(`/profile/${activeReport.postUserId}`)
                        }
                      >
                        {activeReport.postOwner?.profilePicture ? (
                          <img
                            src={activeReport.postOwner.profilePicture}
                            alt={activeReport.postOwner.username}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-blue-500 text-white">
                            {activeReport.postOwner?.username
                              .charAt(0)
                              .toUpperCase() || "?"}
                          </div>
                        )}
                      </div>
                      <div
                        className="ml-4 cursor-pointer"
                        onClick={() =>
                          navigate(`/profile/${activeReport.postUserId}`)
                        }
                      >
                        <h3 className="text-lg font-medium text-gray-900 hover:text-blue-600">
                          {activeReport.postOwner?.username}
                        </h3>
                        <div className="text-sm text-gray-500">
                          Posted on {formatDate(activeReport.createdAt)}
                        </div>
                      </div>
                    </div>

                    {/* Post Content */}
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-4">
                      {activeReport.reportedPost?.image && (
                        <img
                          src={activeReport.reportedPost.image}
                          alt="Post"
                          className="w-full max-h-64 object-contain bg-gray-50"
                        />
                      )}
                      <div className="p-4">
                        <p className="text-gray-800">
                          {activeReport.reportedPost?.desc ||
                            "No description provided"}
                        </p>
                      </div>
                    </div>

                    {/* Post Actions */}
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() =>
                          navigate(`/profile/${activeReport.postUserId}`)
                        }
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 flex items-center"
                      >
                        <FaUser className="mr-1" size={12} />
                        View User Profile
                      </button>
                      <button
                        onClick={() =>
                          handleDeletePost(
                            activeReport.itemId,
                            activeReport._id
                          )
                        }
                        className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 flex items-center"
                        disabled={deletePostLoading}
                      >
                        {deletePostLoading ? (
                          <>
                            <div className="w-3 h-3 mr-1 border-t-2 border-r-2 border-red-700 rounded-full animate-spin"></div>
                            Deleting...
                          </>
                        ) : (
                          <>
                            <FaTrash className="mr-1" size={12} />
                            Delete Post
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Report Details */}
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                      <FaFlag className="text-red-500 mr-2" />
                      Report Information
                    </h3>

                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      {/* Reporter */}
                      <div className="flex items-center mb-3">
                        <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                          {activeReport.reporter?.profilePicture ? (
                            <img
                              src={activeReport.reporter.profilePicture}
                              alt={activeReport.reporter.username}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center bg-purple-500 text-white">
                              {activeReport.reporter?.username
                                .charAt(0)
                                .toUpperCase() || "?"}
                            </div>
                          )}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {activeReport.reporter?.username}
                          </div>
                          <div className="text-xs text-gray-500">
                            Reported on {formatDate(activeReport.createdAt)}
                          </div>
                        </div>
                        <span
                          className={`ml-auto px-2 py-1 text-xs font-semibold rounded-full ${
                            statusColors[activeReport.status]
                          }`}
                        >
                          {activeReport.status}
                        </span>
                      </div>

                      {/* Reason */}
                      <div className="mb-3">
                        <div className="text-sm text-gray-500 mb-1">
                          Reason for report:
                        </div>
                        <div className="flex items-center bg-white p-2 rounded border border-gray-200">
                          {reasonIcons[
                            activeReport.reason as keyof typeof reasonIcons
                          ] || reasonIcons.other}
                          <span className="ml-2 text-gray-800 capitalize">
                            {activeReport.reason}
                          </span>
                        </div>
                      </div>

                      {/* Additional Text */}
                      {activeReport.text && (
                        <div>
                          <div className="text-sm text-gray-500 mb-1">
                            Additional details:
                          </div>
                          <p className="text-gray-800 bg-white p-3 rounded border border-gray-200">
                            {activeReport.text}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex justify-between">
                    <div>
                      {activeReport.status === "pending" && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() =>
                              handleUpdateStatus(activeReport._id, "reviewed")
                            }
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
                            disabled={reportActionLoading}
                          >
                            {reportActionLoading ? (
                              <div className="w-4 h-4 mr-2 border-t-2 border-r-2 border-white rounded-full animate-spin"></div>
                            ) : (
                              <FaEye className="mr-2" />
                            )}
                            Mark Reviewed
                          </button>
                          <button
                            onClick={() =>
                              handleUpdateStatus(activeReport._id, "resolved")
                            }
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center"
                            disabled={reportActionLoading}
                          >
                            <FaCheckCircle className="mr-2" />
                            Resolve
                          </button>
                        </div>
                      )}
                      {activeReport.status === "reviewed" && (
                        <button
                          onClick={() =>
                            handleUpdateStatus(activeReport._id, "resolved")
                          }
                          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center"
                          disabled={reportActionLoading}
                        >
                          <FaCheckCircle className="mr-2" />
                          Resolve
                        </button>
                      )}
                      {(activeReport.status === "resolved" ||
                        activeReport.status === "dismissed") && (
                        <button
                          onClick={() =>
                            handleUpdateStatus(activeReport._id, "pending")
                          }
                          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 flex items-center"
                          disabled={reportActionLoading}
                        >
                          <FaHourglass className="mr-2" />
                          Reopen
                        </button>
                      )}
                    </div>

                    {activeReport.status !== "dismissed" && (
                      <button
                        onClick={() =>
                          handleUpdateStatus(activeReport._id, "dismissed")
                        }
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center"
                        disabled={reportActionLoading}
                      >
                        <FaTimesCircle className="mr-2" />
                        Dismiss
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center">
                  <div className="bg-gray-50 rounded-lg p-8">
                    <FaEye className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">
                      No post selected
                    </h3>
                    <p className="text-gray-500">
                      Click on a reported post from the list to view details
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <AdminDashboard />
    </div>
  );
};

export default AdminReportedPostsPage;
