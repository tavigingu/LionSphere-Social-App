import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaExclamationTriangle } from "react-icons/fa";
import useAuthStore from "../store/AuthStore";
import Background from "../components/Home/Background";
import AdminDashboard from "../components/Home/AdminDashboard";

const AdminReportsPage: React.FC = () => {
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
                  Report Management
                </h1>
                <p className="text-gray-500 mt-1">
                  Manage user reports and flags
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="backdrop-blur-md bg-white/10 rounded-xl p-10 text-center">
            <FaExclamationTriangle className="mx-auto text-yellow-500 mb-4 h-16 w-16" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Report Management Module
            </h2>
            <p className="text-gray-600 max-w-lg mx-auto mb-6">
              This section is currently under development. Soon, you'll be able
              to manage user reports, review flagged content, and take
              appropriate actions here.
            </p>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 inline-block text-left">
              <div className="flex">
                <div className="flex-shrink-0">
                  <FaExclamationTriangle className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    <span className="font-medium">Coming Soon:</span> Full
                    report management functionality
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

export default AdminReportsPage;
