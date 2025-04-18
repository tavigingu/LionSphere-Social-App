import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaHome,
  FaSearch,
  FaEnvelope,
  FaBell,
  FaPlusCircle,
  FaUser,
  FaBars,
  FaTimes,
  FaCamera,
  FaEdit,
  FaChevronDown,
  FaEllipsisH,
  FaCog,
  FaHistory,
  FaBookmark,
  FaExclamationTriangle,
  FaSignOutAlt,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import useAuthStore from "../../store/AuthStore";
import useNotificationStore from "../../store/NotificationStore";
import useChatStore from "../../store/ChatStore";
import SearchSidebar from "../Home/SearchSidebar";
import StoryEditor from "../Home/StoryEditor";
import NotificationPanel from "../Home/NotificationPanel";
import FullLogo from "../../assets/LionSphere_longlogo.png";
import Logo from "../../assets/LionSphereLogo.png";
import CreatePostModal from "../Home/CreatePostModal";
import UserReportModal from "../Home/UserReportModal";
import EditProfileModal from "../Profile/EditProfileModal";

// Minimalist Sidebar Component
const MinimalistSidebar: React.FC<{
  activeButton: string;
  setActiveButton: (buttonName: string) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  unreadMessages: number;
  unreadCount: number;
  navigate: (path: string) => void;
  handleClick: (buttonName: string) => void;
}> = ({
  activeButton,
  setActiveButton,
  mobileMenuOpen,
  setMobileMenuOpen,
  unreadMessages,
  unreadCount,
  navigate,
  handleClick,
}) => {
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const createMenuRef = useRef<HTMLDivElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        createMenuRef.current &&
        !createMenuRef.current.contains(event.target as Node)
      ) {
        const createButton = document.querySelector(`[data-button="create"]`);
        if (createButton && !createButton.contains(event.target as Node)) {
          setIsCreateMenuOpen(false);
        }
      }
      if (
        moreMenuRef.current &&
        !moreMenuRef.current.contains(event.target as Node)
      ) {
        const moreButton = document.querySelector(`[data-button="more"]`);
        if (moreButton && !moreButton.contains(event.target as Node)) {
          setIsMoreMenuOpen(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getIconSize = (buttonName: string) => {
    return activeButton === buttonName ? 24 : 20;
  };

  const getIconClass = (buttonName: string) => {
    return `${
      activeButton === buttonName ? "text-blue-600" : "text-blue-500"
    } transition-all duration-300 ease-in-out`;
  };

  interface NavButtonProps {
    name: string;
    icon: React.ReactNode;
    label: string;
    badge?: number | null;
    onClick?: () => void;
  }

  const NavButton: React.FC<NavButtonProps> = ({
    name,
    icon,
    label,
    badge = null,
    onClick,
  }) => {
    const isCreateButton = name === "create";
    const isMoreButton = name === "more";
    const isActive =
      isCreateButton || isMoreButton
        ? isCreateButton
          ? isCreateMenuOpen
          : isMoreMenuOpen
        : activeButton === name;

    return (
      <div className="relative">
        <button
          data-button={name}
          onClick={() => (onClick ? onClick() : handleClick(name))}
          className={`flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 ease-in-out ${
            isActive
              ? "font-bold text-blue-600 bg-blue-50"
              : "font-normal text-gray-700 hover:bg-gray-100"
          }`}
          style={{ cursor: "pointer" }}
          aria-label={label}
        >
          <div className="relative transition-all duration-300 ease-in-out">
            {icon}
            {badge !== null && badge > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {badge > 9 ? "9+" : badge}
              </span>
            )}
          </div>
        </button>

        <AnimatePresence>
          {isCreateButton && isCreateMenuOpen && (
            <motion.div
              initial={{
                opacity: 0,
                height: 0,
                x: -20,
              }}
              animate={{
                opacity: 1,
                height: "auto",
                x: 0,
              }}
              exit={{
                opacity: 0,
                height: 0,
                x: -20,
              }}
              transition={{
                duration: 0.3,
                ease: "easeInOut",
              }}
              className="absolute right-full mr-2 mt-1 bg-white rounded-lg shadow-lg w-full z-10 border border-gray-200 overflow-hidden"
              style={{
                transformOrigin: "right center",
                minWidth: "180px",
              }}
              ref={createMenuRef}
            >
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: -10 },
                  visible: { opacity: 1, y: 0 },
                }}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.05, duration: 0.2 }}
                className="py-2"
              >
                <button
                  onClick={() => handleClick("create-story")}
                  className="flex items-center w-full px-4 py-3 text-left text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                >
                  <FaCamera className="mr-3 text-blue-500" />
                  <span>Create Story</span>
                </button>
              </motion.div>

              <motion.div
                variants={{
                  hidden: { opacity: 0, y: -10 },
                  visible: { opacity: 1, y: 0 },
                }}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.1, duration: 0.2 }}
                className="py-2"
              >
                <button
                  onClick={() => handleClick("create-post")}
                  className="flex items-center w-full px-4 py-3 text-left text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                >
                  <FaEdit className="mr-3 text-blue-500" />
                  <span>Create Post</span>
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isMoreButton && isMoreMenuOpen && (
            <motion.div
              initial={{
                opacity: 0,
                height: 0,
                x: -20,
              }}
              animate={{
                opacity: 1,
                height: "auto",
                x: 0,
              }}
              exit={{
                opacity: 0,
                height: 0,
                x: -20,
              }}
              transition={{
                duration: 0.3,
                ease: "easeInOut",
              }}
              className="absolute right-full mr-2 mb-1 bg-white rounded-lg shadow-lg w-full z-10 border border-gray-200 overflow-hidden"
              style={{
                transformOrigin: "right center",
                minWidth: "180px",
              }}
              ref={moreMenuRef}
            >
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: { opacity: 1, y: 0 },
                }}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.05, duration: 0.2 }}
                className="py-2"
              >
                <button
                  onClick={() => handleClick("settings")}
                  className="flex items-center w-full px-4 py-3 text-left text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                >
                  <FaCog className="mr-3 text-blue-500" />
                  <span>Settings</span>
                </button>
              </motion.div>

              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: { opacity: 1, y: 0 },
                }}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.1, duration: 0.2 }}
                className="py-2"
              >
                <button
                  onClick={() => navigate("/statistics")}
                  className="flex items-center w-full px-4 py-3 text-left text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                >
                  <FaHistory className="mr-3 text-blue-500" />
                  <span>Your activity</span>
                </button>
              </motion.div>

              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: { opacity: 1, y: 0 },
                }}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.15, duration: 0.2 }}
                className="py-2"
              >
                <button
                  onClick={() => handleClick("saved")}
                  className="flex items-center w-full px-4 py-3 text-left text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                >
                  <FaBookmark className="mr-3 text-blue-500" />
                  <span>Saved</span>
                </button>
              </motion.div>

              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: { opacity: 1, y: 0 },
                }}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.2, duration: 0.2 }}
                className="py-2"
              >
                <button
                  onClick={() => handleClick("report")}
                  className="flex items-center w-full px-4 py-3 text-left text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                >
                  <FaExclamationTriangle className="mr-3 text-blue-500" />
                  <span>Report a problem</span>
                </button>
              </motion.div>

              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: { opacity: 1, y: 0 },
                }}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.25, duration: 0.2 }}
                className="py-2"
              >
                <button
                  onClick={() => handleClick("logout")}
                  className="flex items-center w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 transition-colors duration-200"
                >
                  <FaSignOutAlt className="mr-3 text-red-600" />
                  <span>Log out</span>
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <>
      <div className="fixed top-4 right-4 z-50 lg:hidden">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="bg-white p-2 rounded-full shadow-md text-blue-600"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {mobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>
      </div>

      <div
        className={`bg-white shadow-xl overflow-y-auto overflow-x-hidden transition-all duration-300 hover:shadow-2xl z-40 fixed top-0 right-0 bottom-0
          ${
            mobileMenuOpen
              ? "translate-x-0 w-80 sm:w-72 md:w-64"
              : "translate-x-[-100%] w-80 sm:w-72 md:w-64 lg:translate-x-0 lg:w-20 xl:w-20"
          }
          flex flex-col p-4 justify-between items-center`}
      >
        <div className="h-[120px]" />
        <div className="flex flex-col space-y-8 items-center">
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
            badge={unreadMessages}
            onClick={() => navigate("/chat")}
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
                className={`${
                  isCreateMenuOpen ? "text-blue-600" : "text-blue-500"
                } transition-all duration-300 ease-in-out`}
                size={isCreateMenuOpen ? 24 : 20}
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
        <div className="flex flex-col items-center space-y-8">
          <div className="h-[160px]" />
          <NavButton
            name="more"
            icon={
              <FaEllipsisH
                className={`${
                  isMoreMenuOpen ? "text-blue-600" : "text-blue-500"
                } transition-all duration-300 ease-in-out`}
                size={isMoreMenuOpen ? 24 : 20}
              />
            }
            label="More"
          />
        </div>
      </div>

      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  );
};

// Original RegularDashboard
const OriginalDashboard: React.FC<{
  activeButton: string;
  setActiveButton: (buttonName: string) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  isNotificationPanelOpen: boolean;
  setIsNotificationPanelOpen: (open: boolean) => void;
  isPostFormOpen: boolean;
  setIsPostFormOpen: (open: boolean) => void;
  isStoryFormOpen: boolean;
  setIsStoryFormOpen: (open: boolean) => void;
  isNewPostModalOpen: boolean;
  setIsNewPostModalOpen: (open: boolean) => void;
  isReportModalOpen: boolean;
  setIsReportModalOpen: (open: boolean) => void;
  unreadMessages: number;
  unreadCount: number;
  navigate: (path: string) => void;
  user: any;
  logout: () => Promise<void>;
}> = ({
  activeButton,
  setActiveButton,
  mobileMenuOpen,
  setMobileMenuOpen,
  isSearchOpen,
  setIsSearchOpen,
  isNotificationPanelOpen,
  setIsNotificationPanelOpen,
  isPostFormOpen,
  setIsPostFormOpen,
  isStoryFormOpen,
  setIsStoryFormOpen,
  isNewPostModalOpen,
  setIsNewPostModalOpen,
  isReportModalOpen,
  setIsReportModalOpen,
  unreadMessages,
  unreadCount,
  navigate,
  user,
  logout,
}) => {
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const createMenuRef = useRef<HTMLDivElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        createMenuRef.current &&
        !createMenuRef.current.contains(event.target as Node)
      ) {
        const createButton = document.querySelector(`[data-button="create"]`);
        if (createButton && !createButton.contains(event.target as Node)) {
          setIsCreateMenuOpen(false);
        }
      }
      if (
        moreMenuRef.current &&
        !moreMenuRef.current.contains(event.target as Node)
      ) {
        const moreButton = document.querySelector(`[data-button="more"]`);
        if (moreButton && !moreButton.contains(event.target as Node)) {
          setIsMoreMenuOpen(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleClick = (buttonName: string) => {
    if (buttonName === "create") {
      setIsCreateMenuOpen(!isCreateMenuOpen);
      return;
    }
    if (buttonName === "more") {
      setIsMoreMenuOpen(!isMoreMenuOpen);
      return;
    }

    setActiveButton(buttonName);
    setIsCreateMenuOpen(false);
    setIsMoreMenuOpen(false);
    setMobileMenuOpen(false);

    setIsSearchOpen(false);
    setIsNotificationPanelOpen(false);
    setIsPostFormOpen(false);
    setIsStoryFormOpen(false);

    if (buttonName === "search") {
      setIsSearchOpen(true);
    } else if (buttonName === "notifications") {
      setIsNotificationPanelOpen(true);
    } else if (buttonName === "home") {
      navigate("/home");
    } else if (buttonName === "profile") {
      navigate("/profile");
    }
  };

  const handleCreatePost = () => {
    setIsCreateMenuOpen(false);
    setIsNewPostModalOpen(true);
  };

  const handleCreateStory = () => {
    setIsCreateMenuOpen(false);
    setIsStoryFormOpen(true);
  };

  const handleReport = () => {
    setIsCreateMenuOpen(false);
    setIsMoreMenuOpen(false);
    setIsReportModalOpen(true);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  interface NavButtonProps {
    name: string;
    icon: React.ReactNode;
    label: string;
    badge?: number | null;
    onClick?: () => void;
  }

  const NavButton: React.FC<NavButtonProps> = ({
    name,
    icon,
    label,
    badge = null,
    onClick,
  }) => {
    const isCreateButton = name === "create";
    const isMoreButton = name === "more";
    const isActive =
      isCreateButton || isMoreButton
        ? isCreateButton
          ? isCreateMenuOpen
          : isMoreMenuOpen
        : activeButton === name;

    return (
      <div className={`relative ${isMoreButton ? "mt-auto" : ""}`}>
        <button
          data-button={name}
          onClick={() => (onClick ? onClick() : handleClick(name))}
          className={`flex items-center w-full p-3 text-left rounded-lg transition-all duration-200 ${
            isActive
              ? "font-bold text-blue-600 bg-blue-50"
              : "font-normal text-gray-700 hover:bg-gray-100"
          } ${isMinimalist ? "justify-center" : ""}`}
          style={{ cursor: "pointer" }}
        >
          <div className="relative">
            {icon}
            {badge !== null && badge > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {badge > 9 ? "9+" : badge}
              </span>
            )}
          </div>
          {!isMinimalist && (
            <div className="flex justify-between items-center w-full">
              <span className="flex-1">{label}</span>
              {(isCreateButton || isMoreButton) && (
                <span
                  className={`transition-transform duration-300 ${
                    (isCreateButton && isCreateMenuOpen) ||
                    (isMoreButton && isMoreMenuOpen)
                      ? "rotate-180"
                      : ""
                  }`}
                >
                  <FaChevronDown size={12} />
                </span>
              )}
            </div>
          )}
        </button>

        <AnimatePresence>
          {isCreateButton && isCreateMenuOpen && (
            <motion.div
              initial={{
                opacity: 0,
                height: 0,
                y: isMinimalist ? 0 : -10,
                x: isMinimalist ? 20 : 0,
              }}
              animate={{
                opacity: 1,
                height: "auto",
                y: 0,
                x: 0,
              }}
              exit={{
                opacity: 0,
                height: 0,
                y: isMinimalist ? 0 : -10,
                x: isMinimalist ? 20 : 0,
              }}
              transition={{
                duration: 0.2,
                ease: "easeInOut",
              }}
              className={`absolute ${
                isMinimalist ? "left-full ml-2" : "top-full left-0"
              } mt-1 bg-white rounded-lg shadow-lg w-full z-10 border border-gray-200 overflow-hidden`}
              style={{
                transformOrigin: isMinimalist ? "left center" : "top center",
                minWidth: "180px",
              }}
            >
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: -10 },
                  visible: { opacity: 1, y: 0 },
                }}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.05 }}
                className="py-2"
                ref={createMenuRef}
              >
                <button
                  onClick={handleCreateStory}
                  className="flex items-center w-full px-4 py-3 text-left text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                >
                  <FaCamera className="mr-3 text-blue-500" />
                  <span>Create Story</span>
                </button>
              </motion.div>

              <motion.div
                variants={{
                  hidden: { opacity: 0, y: -10 },
                  visible: { opacity: 1, y: 0 },
                }}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.1 }}
                className="py-2"
              >
                <button
                  onClick={handleCreatePost}
                  className="flex items-center w-full px-4 py-3 text-left text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                >
                  <FaEdit className="mr-3 text-blue-500" />
                  <span>Create Post</span>
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isMoreButton && isMoreMenuOpen && (
            <motion.div
              initial={{
                opacity: 0,
                height: 0,
                y: isMinimalist ? 0 : 10,
                x: isMinimalist ? 20 : 0,
              }}
              animate={{
                opacity: 1,
                height: "auto",
                y: 0,
                x: 0,
              }}
              exit={{
                opacity: 0,
                height: 0,
                y: isMinimalist ? 0 : 10,
                x: isMinimalist ? 20 : 0,
              }}
              transition={{
                duration: 0.2,
                ease: "easeInOut",
              }}
              className={`absolute ${
                isMinimalist ? "left-full ml-2" : "bottom-full left-0"
              } mb-1 bg-white rounded-lg shadow-lg w-full z-10 border border-gray-200 overflow-hidden`}
              style={{
                transformOrigin: isMinimalist ? "left center" : "bottom center",
                minWidth: "180px",
              }}
              ref={moreMenuRef}
            >
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: { opacity: 1, y: 0 },
                }}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.05 }}
                className="py-2"
              >
                <button
                  onClick={() => handleClick("settings")}
                  className="flex items-center w-full px-4 py-3 text-left text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                >
                  <FaCog className="mr-3 text-blue-500" />
                  <span>Settings</span>
                </button>
              </motion.div>

              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: { opacity: 1, y: 0 },
                }}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.1 }}
                className="py-2"
              >
                <button
                  onClick={() => navigate("/statistics")}
                  className="flex items-center w-full px-4 py-3 text-left text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                >
                  <FaHistory className="mr-3 text-blue-500" />
                  <span>Your activity</span>
                </button>
              </motion.div>

              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: { opacity: 1, y: 0 },
                }}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.15 }}
                className="py-2"
              >
                <button
                  onClick={() => handleClick("saved")}
                  className="flex items-center w-full px-4 py-3 text-left text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                >
                  <FaBookmark className="mr-3 text-blue-500" />
                  <span>Saved</span>
                </button>
              </motion.div>

              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: { opacity: 1, y: 0 },
                }}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.2 }}
                className="py-2"
              >
                <button
                  onClick={handleReport}
                  className="flex items-center w-full px-4 py-3 text-left text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                >
                  <FaExclamationTriangle className="mr-3 text-blue-500" />
                  <span>Report a problem</span>
                </button>
              </motion.div>

              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: { opacity: 1, y: 0 },
                }}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.25 }}
                className="py-2"
              >
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 transition-colors"
                >
                  <FaSignOutAlt className="mr-3 text-red-600" />
                  <span>Log out</span>
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <>
      <div className="fixed top-4 right-4 z-50 lg:hidden">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="bg-white p-2 rounded-full shadow-md text-blue-600"
        >
          {mobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>
      </div>

      <div
        className={`bg-white shadow-xl overflow-y-auto overflow-x-hidden transition-all duration-300 hover:shadow-2xl z-40 fixed top-0 right-0 bottom-0
          ${
            mobileMenuOpen
              ? "translate-x-0 w-80 sm:w-72 md:w-64"
              : "translate-x-full w-80 sm:w-72 md:w-64 lg:translate-x-0 lg:w-72 xl:w-80"
          }
          ${
            isMinimalist
              ? "sm:w-16 md:w-16 lg:w-20 xl:w-20"
              : "sm:w-72 md:w-64 lg:w-72 xl:w-80"
          }
          flex flex-col p-4 sm:p-3 md:p-3 lg:p-4`}
      >
        <div className="flex justify-between items-center mb-6 lg:hidden">
          <img
            src={FullLogo}
            alt="LionSphere Logo"
            className="h-10 w-auto object-contain"
          />
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes size={24} />
          </button>
        </div>

        <div className="hidden lg:flex justify-center mb-8 p-2">
          {isMinimalist ? (
            <img
              src={Logo}
              alt="LionSphere Logo"
              className="h-16 w-auto object-contain"
            />
          ) : (
            <img
              src={FullLogo}
              alt="LionSphere Long Logo"
              className="h-16 w-auto object-contain"
            />
          )}
        </div>

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
            badge={unreadMessages}
            onClick={() => navigate("/chat")}
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
                className={`${!isMinimalist ? "mr-4" : ""} ${
                  isCreateMenuOpen ? "text-blue-600" : "text-blue-500"
                } transition-all duration-200`}
                size={isCreateMenuOpen ? 24 : 20}
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

        {!isMinimalist && (
          <>
            <div className="border-t border-gray-200 my-4"></div>
            <div className="px-3">
              <div className="flex flex-wrap gap-1 text-xs text-gray-300">
                <a
                  href="/about"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  About
                </a>
                <span>·</span>
                <a
                  href="/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  Privacy Policy
                </a>
                <span>·</span>
                <a
                  href="/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  Terms of Service
                </a>
                <span>·</span>
                <a
                  href="/contact"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  Contact
                </a>
              </div>
              <p className="text-xs text-gray-300 mt-2 text-center">
                © 2025 LIONSHPERE BY TAVI GINGU
              </p>
            </div>
          </>
        )}

        <NavButton
          name="more"
          icon={
            <FaEllipsisH
              className={`${!isMinimalist ? "mr-4" : ""} ${
                isMoreMenuOpen ? "text-blue-600" : "text-blue-500"
              } transition-all duration-200`}
              size={isMoreMenuOpen ? 24 : 20}
            />
          }
          label="More"
        />
      </div>

      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  );
};

// Main RegularDashboard Component with Conditional Rendering
const RegularDashboard: React.FC = () => {
  const { logout, user } = useAuthStore();
  const { unreadCount, fetchUnreadCount } = useNotificationStore();
  const { chats } = useChatStore();
  const navigate = useNavigate();
  const location = useLocation();

  const unreadMessages =
    chats?.reduce((total, chat) => total + (chat.unreadCount || 0), 0) || 0;

  const [activeButton, setActiveButton] = useState("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const [isPostFormOpen, setIsPostFormOpen] = useState(false);
  const [isStoryFormOpen, setIsStoryFormOpen] = useState(false);
  const [isNewPostModalOpen, setIsNewPostModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false); // Added state for EditProfileModal

  const isMinimalist =
    isSearchOpen ||
    isNotificationPanelOpen ||
    isPostFormOpen ||
    isStoryFormOpen;

  useEffect(() => {
    const path = location.pathname;
    if (path.includes("/profile")) {
      setActiveButton("profile");
    } else if (path.includes("/home")) {
      setActiveButton("home");
    } else if (path.includes("/chat")) {
      setActiveButton("messages");
    }
  }, [location.pathname]);

  useEffect(() => {
    if (user?._id) {
      fetchUnreadCount(user._id);
      const interval = setInterval(() => {
        fetchUnreadCount(user._id);
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [user, fetchUnreadCount]);

  const handleClick = (buttonName: string) => {
    if (buttonName === "create") {
      return; // Handled within the components
    }
    if (buttonName === "more") {
      return; // Handled within the components
    }
    if (buttonName === "create-post") {
      setIsNewPostModalOpen(true);
      return;
    }
    if (buttonName === "create-story") {
      setIsStoryFormOpen(true);
      return;
    }
    if (buttonName === "report") {
      setIsReportModalOpen(true);
      return;
    }
    if (buttonName === "logout") {
      logout().then(() => navigate("/login"));
      return;
    }
    if (buttonName === "saved") {
      navigate("/profile", { state: { activeTab: "saved" } });
      setActiveButton("profile");
      return;
    }
    if (buttonName === "settings") {
      navigate("/profile");
      setActiveButton("profile");
      setIsEditProfileModalOpen(true);
      return;
    }

    setActiveButton(buttonName);
    setMobileMenuOpen(false);

    setIsSearchOpen(false);
    setIsNotificationPanelOpen(false);
    setIsPostFormOpen(false);
    setIsStoryFormOpen(false);

    if (buttonName === "search") {
      setIsSearchOpen(true);
    } else if (buttonName === "notifications") {
      setIsNotificationPanelOpen(true);
    } else if (buttonName === "home") {
      navigate("/home");
    } else if (buttonName === "profile") {
      navigate("/profile");
    }
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
  };

  const handleCloseStoryForm = () => {
    setIsStoryFormOpen(false);
  };

  const handleCloseNewPostModal = () => {
    setIsNewPostModalOpen(false);
  };

  const handleCloseReportModal = () => {
    setIsReportModalOpen(false);
  };

  const handleCloseEditProfileModal = () => {
    setIsEditProfileModalOpen(false);
  };

  return (
    <>
      <AnimatePresence>
        {isMinimalist ? (
          <motion.div
            key="minimalist"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            <MinimalistSidebar
              activeButton={activeButton}
              setActiveButton={setActiveButton}
              mobileMenuOpen={mobileMenuOpen}
              setMobileMenuOpen={setMobileMenuOpen}
              unreadMessages={unreadMessages}
              unreadCount={unreadCount}
              navigate={navigate}
              handleClick={handleClick}
            />
          </motion.div>
        ) : (
          <motion.div
            key="original"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            <OriginalDashboard
              activeButton={activeButton}
              setActiveButton={setActiveButton}
              mobileMenuOpen={mobileMenuOpen}
              setMobileMenuOpen={setMobileMenuOpen}
              isSearchOpen={isSearchOpen}
              setIsSearchOpen={setIsSearchOpen}
              isNotificationPanelOpen={isNotificationPanelOpen}
              setIsNotificationPanelOpen={setIsNotificationPanelOpen}
              isPostFormOpen={isPostFormOpen}
              setIsPostFormOpen={setIsPostFormOpen}
              isStoryFormOpen={isStoryFormOpen}
              setIsStoryFormOpen={setIsStoryFormOpen}
              isNewPostModalOpen={isNewPostModalOpen}
              setIsNewPostModalOpen={setIsNewPostModalOpen}
              isReportModalOpen={isReportModalOpen}
              setIsReportModalOpen={setIsReportModalOpen}
              unreadMessages={unreadMessages}
              unreadCount={unreadCount}
              navigate={navigate}
              user={user}
              logout={logout}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ zIndex: 50 }}>
        <SearchSidebar isOpen={isSearchOpen} onClose={handleCloseSearch} />
      </div>

      <div style={{ zIndex: 50 }}>
        <NotificationPanel
          isOpen={isNotificationPanelOpen}
          onClose={handleCloseNotifications}
        />
      </div>

      {isStoryFormOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm z-50"
            onClick={handleCloseStoryForm}
          />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md h-[80vh] bg-black rounded-xl shadow-2xl overflow-hidden">
            <StoryEditor
              onCancel={handleCloseStoryForm}
              onStoryCreated={handleCloseStoryForm}
            />
          </div>
        </>
      )}

      <CreatePostModal
        isOpen={isNewPostModalOpen}
        onClose={handleCloseNewPostModal}
      />

      <UserReportModal
        isOpen={isReportModalOpen}
        onClose={handleCloseReportModal}
      />

      {isEditProfileModalOpen && user && (
        <EditProfileModal
          user={user}
          isOpen={isEditProfileModalOpen}
          onClose={handleCloseEditProfileModal}
          onProfileUpdate={() => {}}
        />
      )}
    </>
  );
};

export default RegularDashboard;
