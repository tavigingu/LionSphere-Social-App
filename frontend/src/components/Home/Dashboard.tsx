import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaHome,
  FaSearch,
  FaEnvelope,
  FaBell,
  FaPlusCircle,
  FaUser,
  FaSignOutAlt,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import useAuthStore from "../../store/AuthStore";
import useNotificationStore from "../../store/NotificationStore";
import SearchSidebar from "../Home/SearchSidebar";
import PostCreationForm from "../PostCreationForm";
import NotificationPanel from "../Home/NotificationPanel";

const Dashboard: React.FC = () => {
  const { logout, user } = useAuthStore();
  const { unreadCount, fetchUnreadCount } = useNotificationStore();
  const navigate = useNavigate();
  const [activeButton, setActiveButton] = useState("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCompressed, setIsCompressed] = useState(false);
  const [isPostFormOpen, setIsPostFormOpen] = useState(false);
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);

  // Fetch unread notification count when user is available
  useEffect(() => {
    if (user?._id) {
      fetchUnreadCount(user._id);

      // Set up polling for notifications
      const interval = setInterval(() => {
        fetchUnreadCount(user._id);
      }, 30000); // Check every 30 seconds

      return () => clearInterval(interval);
    }
  }, [user, fetchUnreadCount]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleClick = (buttonName: string) => {
    setActiveButton(buttonName);
    setMobileMenuOpen(false);

    if (buttonName === "search") {
      setIsSearchOpen(true);
      setIsCompressed(true);
      setIsNotificationPanelOpen(false);
      return;
    }

    if (buttonName === "notifications") {
      setIsNotificationPanelOpen(true);
      setIsSearchOpen(false);
      setIsCompressed(true);
      return;
    }

    if (buttonName === "create") {
      setIsPostFormOpen(true);
      setIsNotificationPanelOpen(false);
      setIsSearchOpen(false);
      return;
    }

    // Close sidebars when navigating
    setIsNotificationPanelOpen(false);
    setIsSearchOpen(false);
    setIsCompressed(false);

    switch (buttonName) {
      case "home":
        navigate("/home");
        break;
      case "profile":
        navigate("/profile");
        break;
    }
  };

  const handleCloseSearch = () => {
    setIsSearchOpen(false);
    setIsCompressed(false);
    if (activeButton === "search") {
      setActiveButton("home");
    }
  };

  const handleCloseNotifications = () => {
    setIsNotificationPanelOpen(false);
    setIsCompressed(false);
    if (activeButton === "notifications") {
      setActiveButton("home");
    }
  };

  const handleClosePostForm = () => {
    setIsPostFormOpen(false);
    if (activeButton === "create") {
      setActiveButton("home");
    }
  };

  const getIconSize = (buttonName: string) => {
    return activeButton === buttonName ? 24 : 20;
  };

  const getIconClass = (buttonName: string) => {
    return `mr-4 ${
      activeButton === buttonName ? "text-blue-600" : "text-blue-500"
    } transition-all duration-200`;
  };

  interface NavButtonProps {
    name: string;
    icon: React.ReactNode;
    label: string;
    badge?: number | null;
  }

  const NavButton = ({ name, icon, label, badge = null }: NavButtonProps) => (
    <button
      onClick={() => handleClick(name)}
      className={`flex items-center w-full p-3 text-left rounded-lg transition-all duration-200 ${
        activeButton === name
          ? "font-bold text-blue-600 bg-blue-50"
          : "font-normal text-gray-700 hover:bg-gray-100"
      }`}
      style={{ cursor: "pointer" }}
    >
      <div className="relative">
        {icon}
        {badge !== null && badge > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {badge > 9 ? "9+" : badge}
          </span>
        )}
      </div>
      <span className={`flex-1 ${isCompressed ? "lg:hidden" : ""}`}>
        {label}
      </span>
    </button>
  );

  return (
    <>
      {/* Mobile menu toggle */}
      <div className="fixed top-4 right-4 z-50 lg:hidden">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="bg-white p-2 rounded-full shadow-md text-blue-600"
        >
          {mobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>
      </div>

      {/* Dashboard Sidebar */}
      <div
        className={`bg-white shadow-xl overflow-y-auto overflow-x-hidden transition-all duration-300 hover:shadow-2xl z-40
          ${
            mobileMenuOpen
              ? "fixed inset-0 p-4"
              : "fixed -right-80 top-0 bottom-0 w-80 p-4 lg:right-0"
          } 
          ${isCompressed ? "lg:w-20" : "lg:w-80"}
          lg:p-4 lg:fixed lg:right-0 lg:top-0 lg:bottom-0 flex flex-col`}
      >
        {/* Mobile header */}
        <div className="flex justify-between items-center mb-6 lg:hidden">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent font-dancing">
            LionSphere
          </h1>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes size={24} />
          </button>
        </div>

        {/* Desktop Title */}
        <div
          className={`hidden ${
            isCompressed ? "lg:hidden" : "lg:block"
          } mb-8 p-2`}
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent font-dancing">
            LionSphere
          </h1>
        </div>

        {/* Navigation Menu */}
        <div className="space-y-2">
          <NavButton
            name="home"
            icon={
              <FaHome
                className={getIconClass("home")}
                size={getIconSize("home")}
              />
            }
            label="Home"
          />
          <NavButton
            name="search"
            icon={
              <FaSearch
                className={getIconClass("search")}
                size={getIconSize("search")}
              />
            }
            label="Search"
          />
          <NavButton
            name="messages"
            icon={
              <FaEnvelope
                className={getIconClass("messages")}
                size={getIconSize("messages")}
              />
            }
            label="Messages"
          />
          <NavButton
            name="notifications"
            icon={
              <FaBell
                className={getIconClass("notifications")}
                size={getIconSize("notifications")}
              />
            }
            label="Notifications"
            badge={unreadCount}
          />
          <NavButton
            name="create"
            icon={
              <FaPlusCircle
                className={getIconClass("create")}
                size={getIconSize("create")}
              />
            }
            label="Create"
          />
          <NavButton
            name="profile"
            icon={
              <FaUser
                className={getIconClass("profile")}
                size={getIconSize("profile")}
              />
            }
            label="Profile"
          />
        </div>

        {/* User info section */}
        {user && (
          <div className="mt-4 p-3 rounded-lg bg-gray-50 flex items-center">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center mr-3">
              {user.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white text-sm font-bold">
                  {user.username?.charAt(0).toUpperCase() || "U"}
                </span>
              )}
            </div>
            <div
              className={`flex-1 overflow-hidden ${
                isCompressed ? "lg:hidden" : ""
              }`}
            >
              <p className="font-medium text-gray-800 truncate">
                {user.username}
              </p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-gray-200 my-4"></div>

        {/* Footer */}
        <div className={`text-center mb-4 ${isCompressed ? "lg:hidden" : ""}`}>
          <p className="text-xs text-gray-300 font-light tracking-wider">
            © 2025 LIONSHPERE BY TAVI GINGU
          </p>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center w-full p-3 text-left rounded-lg transition-all duration-200 mt-auto font-normal text-red-600 hover:bg-red-50"
          style={{ cursor: "pointer" }}
        >
          <FaSignOutAlt
            className="mr-4 transition-all duration-200"
            size={20}
          />
          <span className={`${isCompressed ? "lg:hidden" : ""}`}>Log out</span>
        </button>
      </div>

      {/* Overlay for mobile menu */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Search Sidebar */}
      <SearchSidebar isOpen={isSearchOpen} onClose={handleCloseSearch} />

      {/* Notification Panel */}
      <NotificationPanel
        isOpen={isNotificationPanelOpen}
        onClose={handleCloseNotifications}
      />

      {/* Post Creation Form Modal */}
      {isPostFormOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={handleClosePostForm}
          />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md p-6 bg-white rounded-lg shadow-xl">
            <PostCreationForm onPostCreated={handleClosePostForm} />
          </div>
        </>
      )}
    </>
  );
};

export default Dashboard;
