import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaExclamationTriangle, FaNewspaper } from "react-icons/fa";
import useAuthStore from "../store/AuthStore";
import Background from "../components/Home/Background";
import AdminDashboard from "../components/Home/AdminDashboard";

const AdminReportedPostsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

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
  }, [user, navigate]);

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
                  Reported Content
                </h1>
                <p className="text-gray-500 mt-1">
                  Review and moderate reported posts, stories, and comments
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="backdrop-blur-md bg-white/10 rounded-xl p-10 text-center">
            <FaNewspaper className="mx-auto text-blue-500 mb-4 h-16 w-16" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Content Moderation Module
            </h2>
            <p className="text-gray-600 max-w-lg mx-auto mb-6">
              This section is currently under development. Soon, you'll be able
              to review reported posts, stories, and comments, and take
              appropriate moderation actions here.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto mt-8">
              <div className="bg-white bg-opacity-30 backdrop-blur-sm p-4 rounded-lg">
                <div className="bg-red-100 w-12 h-12 flex items-center justify-center rounded-full mx-auto mb-3">
                  <FaExclamationTriangle className="text-red-500" />
                </div>
                <h3 className="font-medium text-gray-800">Reported Posts</h3>
                <p className="text-sm text-gray-600 mt-2">
                  Review and moderate posts that have been flagged by users
                </p>
              </div>

              <div className="bg-white bg-opacity-30 backdrop-blur-sm p-4 rounded-lg">
                <div className="bg-orange-100 w-12 h-12 flex items-center justify-center rounded-full mx-auto mb-3">
                  <FaExclamationTriangle className="text-orange-500" />
                </div>
                <h3 className="font-medium text-gray-800">Reported Stories</h3>
                <p className="text-sm text-gray-600 mt-2">
                  Review and moderate stories that have been flagged by users
                </p>
              </div>

              <div className="bg-white bg-opacity-30 backdrop-blur-sm p-4 rounded-lg">
                <div className="bg-yellow-100 w-12 h-12 flex items-center justify-center rounded-full mx-auto mb-3">
                  <FaExclamationTriangle className="text-yellow-500" />
                </div>
                <h3 className="font-medium text-gray-800">Reported Comments</h3>
                <p className="text-sm text-gray-600 mt-2">
                  Review and moderate comments that have been flagged by users
                </p>
              </div>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 inline-block text-left mt-8">
              <div className="flex">
                <div className="flex-shrink-0">
                  <FaExclamationTriangle className="h-5 w-5 text-blue-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    <span className="font-medium">Coming Soon:</span> Full
                    content moderation functionality
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <AdminDashboard />
    </div>
  );
};

export default AdminReportedPostsPage;
