import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUser,
  FaSearch,
  FaTrash,
  FaUserShield,
  FaCheckCircle,
  FaBan,
  FaEnvelope,
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
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);

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

    // Fetch some users using the suggested users API
    const fetchUsers = async () => {
      setLoading(true);
      try {
        // First get suggested users
        const suggestedUsers = await getSuggestedUsers(currentUser._id);

        // Then fetch a few more users
        const response = await axios.get(
          `http://localhost:5001/user/all?limit=20`
        );

        if (response.data.success) {
          // Combine all users and remove duplicates
          const allUsers = [...suggestedUsers, ...response.data.users];
          const uniqueUsers = allUsers.filter(
            (user, index, self) =>
              index === self.findIndex((u) => u._id === user._id)
          );

          setUsers(uniqueUsers);
          setFilteredUsers(uniqueUsers);
        } else {
          setError("Failed to fetch users");
        }
      } catch (err) {
        console.error("Error fetching users:", err);
        setError("Error fetching users");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [currentUser, navigate]);

  // Filter users when search term changes
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredUsers(users);
      return;
    }

    const filtered = users.filter(
      (user) =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.firstname &&
          user.firstname.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.lastname &&
          user.lastname.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.email &&
          user.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const handleViewProfile = (userId: string) => {
    navigate(`/profile/${userId}`);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleUserSelect = (user: IUser) => {
    setSelectedUser(user);
  };

  if (loading) {
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
          {/* Header */}
          <div className="backdrop-blur-md bg-white/10 rounded-xl p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  User Management
                </h1>
                <p className="text-gray-500 mt-1">
                  Manage users, roles, and permissions
                </p>
              </div>
              <div className="mt-4 md:mt-0 relative">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="pl-10 pr-4 py-2 bg-white/50 backdrop-blur-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64"
                  />
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Users List */}
            <div className="lg:col-span-2">
              <div className="backdrop-blur-md bg-white/10 rounded-xl overflow-hidden">
                <div className="bg-gray-800/20 px-6 py-4 border-b border-gray-200">
                  <h2 className="font-semibold text-gray-800">
                    All Users ({filteredUsers.length})
                  </h2>
                </div>

                <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
                  {filteredUsers.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                      {searchTerm
                        ? "No users found matching your search."
                        : "No users available."}
                    </div>
                  ) : (
                    filteredUsers.map((user) => (
                      <div
                        key={user._id}
                        className={`p-4 hover:bg-white/20 transition-colors cursor-pointer flex items-center ${
                          selectedUser?._id === user._id ? "bg-blue-50/50" : ""
                        }`}
                        onClick={() => handleUserSelect(user)}
                      >
                        <div className="h-12 w-12 rounded-full overflow-hidden mr-4 border border-gray-200">
                          {user.profilePicture ? (
                            <img
                              src={user.profilePicture}
                              alt={user.username}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                              <span className="text-white font-bold">
                                {user.username.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center">
                            <h3 className="font-medium text-gray-800">
                              {user.username}
                            </h3>
                            {user.role === "admin" && (
                              <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs">
                                Admin
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">
                            {user.firstname} {user.lastname}
                          </p>
                        </div>

                        <div className="flex space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewProfile(user._id);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                            title="View Profile"
                          >
                            <FaUser size={16} />
                          </button>

                          <button
                            className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors"
                            title="Delete User"
                          >
                            <FaTrash size={16} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* User Details Panel */}
            <div className="lg:col-span-1">
              <div className="backdrop-blur-md bg-white/10 rounded-xl overflow-hidden">
                <div className="bg-gray-800/20 px-6 py-4 border-b border-gray-200">
                  <h2 className="font-semibold text-gray-800">User Details</h2>
                </div>

                {selectedUser ? (
                  <div className="p-6">
                    <div className="flex flex-col items-center mb-6">
                      <div className="h-24 w-24 rounded-full overflow-hidden mb-4 border-2 border-blue-500">
                        {selectedUser.profilePicture ? (
                          <img
                            src={selectedUser.profilePicture}
                            alt={selectedUser.username}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                            <span className="text-white text-xl font-bold">
                              {selectedUser.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>

                      <h3 className="text-xl font-bold text-gray-800">
                        {selectedUser.username}
                      </h3>
                      <p className="text-gray-500">
                        {selectedUser.firstname} {selectedUser.lastname}
                      </p>

                      {selectedUser.role === "admin" && (
                        <span className="mt-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          Administrator
                        </span>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm text-gray-500 font-medium">
                          Email
                        </h4>
                        <p className="text-gray-800">{selectedUser.email}</p>
                      </div>

                      <div>
                        <h4 className="text-sm text-gray-500 font-medium">
                          Followers
                        </h4>
                        <p className="text-gray-800">
                          {selectedUser.followers?.length || 0}
                        </p>
                      </div>

                      <div>
                        <h4 className="text-sm text-gray-500 font-medium">
                          Following
                        </h4>
                        <p className="text-gray-800">
                          {selectedUser.following?.length || 0}
                        </p>
                      </div>

                      {selectedUser.about && (
                        <div>
                          <h4 className="text-sm text-gray-500 font-medium">
                            Bio
                          </h4>
                          <p className="text-gray-800">{selectedUser.about}</p>
                        </div>
                      )}
                    </div>

                    <div className="mt-6 space-y-3">
                      <button
                        onClick={() => handleViewProfile(selectedUser._id)}
                        className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                      >
                        <FaUser className="mr-2" />
                        View Profile
                      </button>

                      <button className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center">
                        <FaUserShield className="mr-2" />
                        {selectedUser.role === "admin"
                          ? "Remove Admin"
                          : "Make Admin"}
                      </button>

                      <button className="w-full py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center">
                        <FaBan className="mr-2" />
                        Suspend Account
                      </button>

                      <button className="w-full py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center">
                        <FaEnvelope className="mr-2" />
                        Send Message
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 text-center text-gray-500">
                    <FaUser className="mx-auto mb-3 h-12 w-12 text-gray-300" />
                    <p>Select a user to view details</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <AdminDashboard />
    </div>
  );
};

export default AdminUsersPage;
