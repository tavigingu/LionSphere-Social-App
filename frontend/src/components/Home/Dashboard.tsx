// frontend/src/components/Home/Dashboard.tsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
  FaCamera,
  FaEdit,
} from "react-icons/fa";
import useAuthStore from "../../store/AuthStore";
import useNotificationStore from "../../store/NotificationStore";
import SearchSidebar from "../Home/SearchSidebar";
import PostCreationForm from "../PostCreationForm";
import StoryCreationForm from "../Home/StoryCreationForm"; // Importă componenta de creare story
import NotificationPanel from "../Home/NotificationPanel";

const Dashboard: React.FC = () => {
  const { logout, user } = useAuthStore();
  const { unreadCount, fetchUnreadCount } = useNotificationStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeButton, setActiveButton] = useState("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const [isPostFormOpen, setIsPostFormOpen] = useState(false);
  const [isStoryFormOpen, setIsStoryFormOpen] = useState(false);
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);
  const createMenuRef = useRef<HTMLDivElement>(null);

  // Set active button based on current route
  useEffect(() => {
    const path = location.pathname;
    if (path.includes("/profile")) {
      setActiveButton("profile");
    } else if (path.includes("/home")) {
      setActiveButton("home");
    }
  }, [location.pathname]);

  // Fetch unread notification count
  useEffect(() => {
    if (user?._id) {
      fetchUnreadCount(user._id);
      const interval = setInterval(() => {
        fetchUnreadCount(user._id);
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [user, fetchUnreadCount]);

  // Handle clicks outside create menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        createMenuRef.current &&
        !createMenuRef.current.contains(event.target as Node)
      ) {
        setIsCreateMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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

    // Închide toate panourile și meniurile
    setIsSearchOpen(false);
    setIsNotificationPanelOpen(false);
    setIsPostFormOpen(false);
    setIsStoryFormOpen(false);

    // Dacă am dat click pe butonul create, gestionăm toggleul meniului
    if (buttonName === "create") {
      setIsCreateMenuOpen(!isCreateMenuOpen);
    } else {
      setIsCreateMenuOpen(false); // Închide meniul de creare la click pe alte butoane

      // Navigare pentru alte butoane
      if (buttonName === "search") {
        setIsSearchOpen(true);
      } else if (buttonName === "notifications") {
        setIsNotificationPanelOpen(true);
      } else if (buttonName === "home") navigate("/home");
      else if (buttonName === "profile") navigate("/profile");
    }
  };

  // Funcții pentru gestionarea formularelor
  const handleCreatePost = () => {
    setIsCreateMenuOpen(false);
    setIsPostFormOpen(true);
  };

  const handleCreateStory = () => {
    setIsCreateMenuOpen(false);
    setIsStoryFormOpen(true);
  };

  const handleCloseSearch = () => {
    setIsSearchOpen(false);
    setActiveButton(
      location.pathname.includes("/profile") ? "profile" : "home"
    );
  };

  const handleCloseNotifications = () => {
    setIsNotificationPanelOpen(false);
    setActiveButton(
      location.pathname.includes("/profile") ? "profile" : "home"
    );
  };

  const handleClosePostForm = () => {
    setIsPostFormOpen(false);
    setActiveButton(
      location.pathname.includes("/profile") ? "profile" : "home"
    );
  };

  const handleCloseStoryForm = () => {
    setIsStoryFormOpen(false);
    setActiveButton(
      location.pathname.includes("/profile") ? "profile" : "home"
    );
  };

  // Dashboard-ul este minimalist dacă oricare panou este deschis
  const isMinimalist =
    isSearchOpen ||
    isNotificationPanelOpen ||
    isPostFormOpen ||
    isStoryFormOpen;

  const getIconSize = (buttonName: string) => {
    return activeButton === buttonName ? 24 : 20;
  };

  const getIconClass = (buttonName: string) => {
    return `${!isMinimalist ? "mr-4" : ""} ${
      activeButton === buttonName ? "text-blue-600" : "text-blue-500"
    } transition-all duration-200`;
  };

  interface NavButtonProps {
    name: string;
    icon: React.ReactNode;
    label: string;
    badge?: number | null;
    onClick?: () => void;
  }

  const NavButton = ({
    name,
    icon,
    label,
    badge = null,
    onClick,
  }: NavButtonProps) => (
    <button
      onClick={() => (onClick ? onClick() : handleClick(name))}
      className={`flex items-center w-full p-3 text-left rounded-lg transition-all duration-200 ${
        activeButton === name
          ? "font-bold text-blue-600 bg-blue-50"
          : "font-normal text-gray-700 hover:bg-gray-100"
      } ${isMinimalist ? "justify-center" : ""}`}
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
      {!isMinimalist && <span className="flex-1">{label}</span>}
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
              : "fixed -right-80 top-0 bottom-0 p-4 lg:right-0"
          }
          ${isMinimalist ? "lg:w-20" : "lg:w-80"}
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

        {/* Desktop Logo - "LS" in minimalist mode */}
        <div className="hidden lg:flex justify-center mb-8 p-2">
          {isMinimalist ? (
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent font-dancing">
              LS
            </h1>
          ) : (
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent font-dancing">
              LionSphere
            </h1>
          )}
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

          {/* Butonul Create cu meniul expandabil */}
          <div className="relative" ref={createMenuRef}>
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

            {/* Meniu expandat pentru creare */}
            {isCreateMenuOpen && (
              <div
                className={`absolute ${
                  isMinimalist ? "left-full ml-2" : "top-full left-0"
                } mt-1 bg-white rounded-lg shadow-lg w-52 py-2 z-10 transition-all duration-200 border border-gray-200`}
              >
                <button
                  onClick={handleCreateStory}
                  className="flex items-center w-full px-4 py-3 text-left text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                >
                  <FaCamera className="mr-3 text-blue-500" />
                  <span>Create Story</span>
                </button>
                <button
                  onClick={handleCreatePost}
                  className="flex items-center w-full px-4 py-3 text-left text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                >
                  <FaEdit className="mr-3 text-blue-500" />
                  <span>Create Post</span>
                </button>
              </div>
            )}
          </div>

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

        {/* User info - just profile pic in minimalist mode */}
        {user && (
          <div
            className={`mt-4 ${
              isMinimalist
                ? "flex justify-center"
                : "p-3 rounded-lg bg-gray-50 flex items-center"
            }`}
          >
            <div
              className={`${
                isMinimalist ? "w-10 h-10" : "w-10 h-10 mr-3"
              } rounded-full overflow-hidden bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center`}
            >
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

            {/* Full user info in normal mode */}
            {!isMinimalist && (
              <div className="flex-1 overflow-hidden">
                <p className="font-medium text-gray-800 truncate">
                  {user.username}
                </p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            )}
          </div>
        )}

        {/* Divider and footer - hidden in minimalist mode */}
        {!isMinimalist && <div className="border-t border-gray-200 my-4"></div>}

        {!isMinimalist && (
          <div className="text-center mb-4">
            <p className="text-xs text-gray-300 font-light tracking-wider">
              © 2025 LIONSHPERE BY TAVI GINGU
            </p>
          </div>
        )}

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className={`flex items-center w-full p-3 text-left rounded-lg transition-all duration-200 mt-auto font-normal text-red-600 hover:bg-red-50 ${
            isMinimalist ? "justify-center" : ""
          }`}
          style={{ cursor: "pointer" }}
        >
          <FaSignOutAlt className="transition-all duration-200" size={20} />
          {!isMinimalist && <span className="ml-4">Log out</span>}
        </button>
      </div>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Panouri laterale */}
      <div style={{ zIndex: 50 }}>
        <SearchSidebar isOpen={isSearchOpen} onClose={handleCloseSearch} />
      </div>

      <div style={{ zIndex: 50 }}>
        <NotificationPanel
          isOpen={isNotificationPanelOpen}
          onClose={handleCloseNotifications}
        />
      </div>

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

      {/* Story Creation Form Modal */}
      {isStoryFormOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={handleCloseStoryForm}
          />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md p-6 bg-white rounded-lg shadow-xl">
            <StoryCreationForm onStoryCreated={handleCloseStoryForm} />
          </div>
        </>
      )}
    </>
  );
};

export default Dashboard;
