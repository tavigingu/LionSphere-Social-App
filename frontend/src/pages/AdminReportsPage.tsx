import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaExclamationTriangle,
  FaFilter,
  FaEye,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglass,
} from "react-icons/fa";
import axios from "axios";
import useAuthStore from "../store/AuthStore";
import Background from "../components/Home/Background";
import AdminDashboard from "../components/Home/AdminDashboard";
import api from "../api/axiosConfig";

interface Report {
  _id: string;
  userId: string;
  type: "general";
  category?: string;
  text?: string;
  status: "pending" | "reviewed" | "resolved" | "dismissed";
  createdAt: string;
  reporter: {
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

const typeIcons = {
  general: <FaExclamationTriangle className="text-amber-500" />,
};

const AdminReportsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("pending");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeReport, setActiveReport] = useState<Report | null>(null);
  const [reportActionLoading, setReportActionLoading] = useState(false);

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

    fetchReports();
  }, [user, navigate, filterStatus, currentPage]);

  const fetchReports = async () => {
    setLoading(true);
    try {
  
      let endpoint = `/report?page=${currentPage}&limit=10&type=general`;

      if (filterStatus !== "all") {
        endpoint += `&status=${filterStatus}`;
      }

      const response = await api.get(endpoint);

      if (response.data.success) {
        setReports(response.data.reports);
        setTotalPages(response.data.pagination.totalPages);
      } else {
        setError("Failed to fetch reports");
      }
    } catch (err) {
      console.error("Error fetching reports:", err);
      setError("Error fetching reports");
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
        setReports((prev) =>
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  if (loading && reports.length === 0) {
    return (
      <div className="relative min-h-screen">
        <Background />
        <div className="container mx-auto px-4 py-4 relative z-10 lg:pr-96">
          <div className="flex justify-center items-center h-screen">
            <div className="flex flex-col items-center">
              <div className="animate-spin w-12 h-12 border-4 border-t-blue-500 border-blue-200 rounded-full"></div>
              <p className="mt-4 text-lg text-gray-800">Loading reports...</p>
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
                  Reports Management
                </h1>
                <p className="text-gray-500 mt-1">
                  Review and manage user reports and feedback
                </p>
              </div>

              {/* Filters */}
              <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
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
            {/* Reports table */}
            <div className="backdrop-blur-md bg-white/80 rounded-xl overflow-hidden shadow-lg lg:flex-1">
              <div className="bg-gray-100 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="font-semibold text-gray-800">
                  General Reports ({reports.length})
                </h2>
                <div className="text-sm text-gray-500">
                  Displaying page {currentPage} of {totalPages}
                </div>
              </div>

              {reports.length === 0 ? (
                <div className="p-6 text-center">
                  <div className="bg-gray-100 rounded-lg p-8 max-w-md mx-auto">
                    <FaExclamationTriangle className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">
                      No reports found
                    </h3>
                    <p className="text-gray-500">
                      {filterStatus !== "all"
                        ? `No reports match your current filters.`
                        : "There are no general reports in the system yet."}
                    </p>
                    {filterStatus !== "all" && (
                      <button
                        onClick={() => {
                          setFilterStatus("all");
                        }}
                        className="mt-4 px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                      >
                        Clear filters
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Reporter
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Content
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Date
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Status
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {reports.map((report) => (
                        <tr
                          key={report._id}
                          className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                            activeReport?._id === report._id ? "bg-blue-50" : ""
                          }`}
                          onClick={() => setActiveReport(report)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                                {report.reporter.profilePicture ? (
                                  <img
                                    src={report.reporter.profilePicture}
                                    alt={report.reporter.username}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center bg-blue-500 text-white">
                                    {report.reporter.username
                                      .charAt(0)
                                      .toUpperCase()}
                                  </div>
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {report.reporter.username}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 line-clamp-2">
                              {(report.category ? `${report.category}: ` : "") +
                                (report.text || "No details provided")}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(report.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                statusColors[report.status]
                              }`}
                            >
                              {report.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              {report.status === "pending" && (
                                <>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleUpdateStatus(
                                        report._id,
                                        "reviewed"
                                      );
                                    }}
                                    className="text-blue-600 hover:text-blue-900"
                                    title="Mark as Reviewed"
                                  >
                                    <FaEye />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleUpdateStatus(
                                        report._id,
                                        "resolved"
                                      );
                                    }}
                                    className="text-green-600 hover:text-green-900"
                                    title="Mark as Resolved"
                                  >
                                    <FaCheckCircle />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleUpdateStatus(
                                        report._id,
                                        "dismissed"
                                      );
                                    }}
                                    className="text-red-600 hover:text-red-900"
                                    title="Dismiss"
                                  >
                                    <FaTimesCircle />
                                  </button>
                                </>
                              )}
                              {report.status === "reviewed" && (
                                <>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleUpdateStatus(
                                        report._id,
                                        "resolved"
                                      );
                                    }}
                                    className="text-green-600 hover:text-green-900"
                                    title="Mark as Resolved"
                                  >
                                    <FaCheckCircle />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleUpdateStatus(
                                        report._id,
                                        "dismissed"
                                      );
                                    }}
                                    className="text-red-600 hover:text-red-900"
                                    title="Dismiss"
                                  >
                                    <FaTimesCircle />
                                  </button>
                                </>
                              )}
                              {(report.status === "resolved" ||
                                report.status === "dismissed") && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUpdateStatus(report._id, "pending");
                                  }}
                                  className="text-gray-600 hover:text-gray-900"
                                  title="Reopen"
                                >
                                  <FaHourglass />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
                <h2 className="font-semibold text-gray-800">Report Details</h2>
              </div>

              {activeReport ? (
                <div className="p-6">
                  <div className="mb-6 pb-6 border-b border-gray-200">
                    <div className="flex items-center mb-4">
                      <div className="h-12 w-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                        {activeReport.reporter.profilePicture ? (
                          <img
                            src={activeReport.reporter.profilePicture}
                            alt={activeReport.reporter.username}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-blue-500 text-white">
                            {activeReport.reporter.username
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-gray-900">
                          {activeReport.reporter.username}
                        </h3>
                        <div className="text-sm text-gray-500">
                          Reported on {formatDate(activeReport.createdAt)}
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <div className="flex items-center mb-2">
                        <div className="mr-2">
                          {typeIcons[activeReport.type]}
                        </div>
                        <h4 className="font-medium text-gray-900 capitalize">
                          {activeReport.type} Report
                        </h4>
                        <span
                          className={`ml-auto px-2 py-1 text-xs font-semibold rounded-full ${
                            statusColors[activeReport.status]
                          }`}
                        >
                          {activeReport.status}
                        </span>
                      </div>

                      {activeReport.category && (
                        <div className="text-sm text-gray-500 mb-2">
                          <span className="font-medium">Category:</span>{" "}
                          {activeReport.category}
                        </div>
                      )}

                      {activeReport.text && (
                        <div className="mt-3">
                          <div className="text-sm text-gray-500 mb-1">
                            Description:
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
                            <FaEye className="mr-2" />
                            Mark Reviewed
                          </button>
                          <button
                            onClick={() =>
                              handleUpdateStatus(activeReport._id, "resolved")
                            }
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-blue-700 flex items-center"
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
                      No report selected
                    </h3>
                    <p className="text-gray-500">
                      Click on a report from the list to view details
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

export default AdminReportsPage;
