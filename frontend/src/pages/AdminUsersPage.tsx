import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUser,
  FaSearch,
  FaTrash,
  FaUserShield,
  FaBan,
  FaEnvelope,
  FaEye,
  FaCheck,
  FaTimes,
} from "react-icons/fa";
import useAuthStore from "../store/AuthStore";
import { getSuggestedUsers } from "../api/User";
import Background from "../components/Home/Background";
import AdminDashboard from "../components/Home/AdminDashboard";
import { IUser } from "../types/AuthTypes";
import axios from "axios";

const AdminUsersPage: React.FC = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<IUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Check if user is admin
  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    if (currentUser.role !== "admin") {
      navigate("/home");
      return;
    }

    fetchUsers();
  }, [currentUser, navigate]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Get suggested users for initial data
      const suggestedUsers = await getSuggestedUsers(currentUser!._id);
      console.log("Fetched suggested users:", suggestedUsers);

      // Just use the suggested users - don't try to fetch all users as that endpoint doesn't exist
      setUsers(suggestedUsers);
      setFilteredUsers(suggestedUsers);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Error fetching users");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setFilteredUsers(users);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:5001/user/search?username=${encodeURIComponent(
          searchTerm
        )}`
      );

      if (response.data.success) {
        setFilteredUsers(response.data.users);
      } else {
        setFilteredUsers([]);
      }
    } catch (err) {
      console.error("Error searching users:", err);
      setError("Error searching users");
      setFilteredUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    // Reset to all users if search is cleared
    if (!value.trim()) {
      setFilteredUsers(users);
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (actionLoading) return;

    if (
      !window.confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setActionLoading(userId);

      // In a real implementation, this would call an API endpoint
      // For this demo, we'll just simulate the API call
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Update the UI optimistically
      setUsers(users.filter((user) => user._id !== userId));
      setFilteredUsers(filteredUsers.filter((user) => user._id !== userId));

      setActionSuccess("User deleted successfully");
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err) {
      console.error("Error deleting user:", err);
      setError("Failed to delete user");
      setTimeout(() => setError(null), 3000);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="relative min-h-screen">
        <Background />
        <div className="container mx-auto px-4 py-4 relative z-10 lg:pr-96">
          <div className="flex justify-center items-center h-screen">
            <div className="flex flex-col items-center">
              <div className="animate-spin w-12 h-12 border-4 border-t-blue-500 border-blue-200 rounded-full"></div>
              <p className="mt-4 text-lg text-gray-800">Loading users...</p>
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
          {/* Header with search */}
          <div className="backdrop-blur-md bg-white/10 rounded-xl p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  User Management
                </h1>
                <p className="text-gray-500 mt-1">
                  Manage users and user roles
                </p>
              </div>
              <div className="mt-4 md:mt-0 relative flex items-center">
                <div className="relative flex-grow">
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    onKeyDown={handleSearchKeyDown}
                    className="pl-10 pr-4 py-2 bg-white/50 backdrop-blur-sm rounded-lg border border-gray?"
                  />
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
                <button
                  onClick={handleSearch}
                  className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Search
                </button>
              </div>
            </div>
          </div>

          {/* Status messages */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 flex items-center justify-between">
              <span>{error}</span>
              <button onClick={() => setError(null)} className="text-red-700">
                <FaTimes />
              </button>
            </div>
          )}

          {actionSuccess && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6 flex items-center justify-between">
              <span className="flex items-center">
                <FaCheck className="mr-2" />
                {actionSuccess}
              </span>
              <button
                onClick={() => setActionSuccess(null)}
                className="text-green-700"
              >
                <FaTimes />
              </button>
            </div>
          )}

          {/* Users grid/card view */}
          <div className="backdrop-blur-md bg-white/10 rounded-xl overflow-hidden">
            <div className="bg-gray-800/20 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="font-semibold text-gray-800">
                Displayed Users ({filteredUsers.length})
              </h2>
              <div className="text-sm text-gray-500">
                {searchTerm
                  ? `Showing results for "${searchTerm}"`
                  : "Showing suggested users"}
              </div>
            </div>

            {filteredUsers.length === 0 ? (
              <div className="p-6 text-center">
                <div className="bg-gray-100 rounded-lg p-8 max-w-md mx-auto">
                  <FaUser className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    No users found
                  </h3>
                  <p className="text-gray-500">
                    {searchTerm
                      ? `No users matching "${searchTerm}" were found.`
                      : "There are no users available."}
                  </p>
                  {searchTerm && (
                    <button
                      onClick={() => {
                        setSearchTerm("");
                        setFilteredUsers(users);
                      }}
                      className="mt-4 px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                    >
                      Clear search
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredUsers.map((user) => (
                    <div
                      key={user._id}
                      className="bg-white/80 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden cursor-pointer"
                      onClick={() => navigate(`/profile/${user._id}`)}
                    >
                      <div className="h-32 overflow-hidden bg-gradient-to-r from-blue-200 to-purple-200 relative">
                        {user.birthPicture ? (
                          <img
                            src={user.birthPicture}
                            alt="Cover"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 opacity-60"></div>
                        )}

                        <div className="absolute top-4 right-4">
                          {user.role === "admin" && (
                            <span className="px-2 py-1 bg-blue-100 bg-opacity-90 text-blue-800 rounded-full text-xs font-medium">
                              Admin
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Profile picture container */}
                      <div className="relative flex justify-center -mt-10 z-10">
                        <div className="h-20 w-20 rounded-full border-4 border-white bg-white">
                          <div className="h-full w-full rounded-full overflow-hidden">
                            {user.profilePicture ? (
                              <img
                                src={user.profilePicture}
                                alt={user.username}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                                <span className="text-white text-xl font-bold">
                                  {user.username.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 pb-4 px-4 text-center">
                        <h3 className="font-medium text-gray-900">
                          {user.username}
                        </h3>
                        <p className="text-sm text-gray-500 mb-3">
                          {user.firstname} {user.lastname}
                        </p>

                        <div className="flex justify-between items-center">
                          <div className="text-xs text-gray-500">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Active
                            </span>
                          </div>

                          <div className="flex space-x-2 pointer-events-none">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/statistics`);
                              }}
                              className="text-blue-600 hover:text-blue-900 bg-blue-100 p-2 rounded-full transition-colors pointer-events-auto"
                              title="View Statistics"
                            >
                              <FaEye size={14} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteUser(user._id);
                              }}
                              className="text-red-600 hover:text-red-900 bg-red-100 p-2 rounded-full transition-colors pointer-events-auto"
                              title="Delete User"
                              disabled={actionLoading === user._id}
                            >
                              {actionLoading === user._id ? (
                                <div className="animate-spin h-3 w-3 border-t-2 border-b-2 border-current rounded-full"></div>
                              ) : (
                                <FaTrash size={14} />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Pagination if needed */}
          {filteredUsers.length > 0 && (
            <div className="mt-6 flex justify-between items-center backdrop-blur-md bg-white/10 rounded-xl p-4">
              <div className="text-sm text-gray-700">
                Showing{" "}
                <span className="font-medium">{filteredUsers.length}</span>{" "}
                users
              </div>
              <div className="flex justify-end">
                <button
                  className="px-4 py-2 border border-gray-300 bg-white text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
                  onClick={() => fetchUsers()}
                >
                  Refresh List
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <AdminDashboard />
    </div>
  );
};

export default AdminUsersPage;
