import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../store/AuthStore";
import useNotificationStore from "../../store/NotificationStore";
import axios from "axios";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaTimes,
  FaHeart,
  FaComment,
  FaUser,
  FaAt,
  FaCheckDouble,
  FaTrash,
  FaBell,
  FaRegImage,
  FaUserPlus,
  FaTag,
} from "react-icons/fa";

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PostDetails {
  image?: string;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification: removeNotification,
  } = useNotificationStore();

  const [isAnimating, setIsAnimating] = useState(false);
  const [postDetails, setPostDetails] = useState<Record<string, PostDetails>>(
    {}
  );
  const [expandedNotification, setExpandedNotification] = useState<
    string | null
  >(null);
  const notificationPanelRef = useRef<HTMLDivElement>(null);

  // Fetch notifications when panel opens
  useEffect(() => {
    if (isOpen && user?._id) {
      fetchNotifications(user._id);
    }
  }, [isOpen, user, fetchNotifications]);

  // Fetch post details for notifications that have postId
  useEffect(() => {
    const fetchPostImages = async () => {
      const postIds = notifications
        .filter((n) => n.postId && !postDetails[n.postId])
        .map((n) => n.postId as string);

      if (postIds.length === 0) return;

      const newPostDetails: Record<string, PostDetails> = { ...postDetails };

      for (const postId of postIds) {
        try {
          const response = await axios.get(
            `http://localhost:5001/post/${postId}`
          );
          if (response.data.success) {
            newPostDetails[postId] = {
              image: response.data.post.image || undefined,
            };
          }
        } catch (error) {
          console.error(`Failed to fetch post ${postId} details:`, error);
        }
      }

      setPostDetails(newPostDetails);
    };

    fetchPostImages();
  }, [notifications]);

  // Handle clicks outside to close the panel
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationPanelRef.current &&
        !notificationPanelRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const navigateToUserProfile = (e: React.MouseEvent, userId: string) => {
    e.stopPropagation();
    navigate(`/profile/${userId}`);
    const notificationId = (
      e.currentTarget.closest("[data-notification-id]") as HTMLElement
    )?.dataset.notificationId;
    if (notificationId) {
      markNotificationAsRead(notificationId);
    }
  };

  const navigateToPost = (
    e: React.MouseEvent,
    postId: string,
    notificationId: string
  ) => {
    e.stopPropagation();
    // In a real implementation, navigate to the post with the comment expanded
    // For now we'll just go to home and mark the notification as read
    navigate(`/home`);
    markNotificationAsRead(notificationId);
  };

  const handleNotificationClick = (
    notificationId: string,
    type: string,
    postId?: string,
    userId?: string
  ) => {
    setExpandedNotification(
      expandedNotification === notificationId ? null : notificationId
    );
    markNotificationAsRead(notificationId);

    // Depending on notification type, we could navigate to different places
    if (type === "follow" && userId) {
      navigate(`/profile/${userId}`);
    } else if (
      (type === "like" || type === "comment" || type === "mention") &&
      postId
    ) {
      // In a real implementation, we could navigate to the post with comment expanded
      // navigate(`/post/${postId}`);
      navigate("/home");
    }
  };

  const handlePostThumbnailClick = (
    e: React.MouseEvent,
    postId: string,
    notificationId: string
  ) => {
    e.stopPropagation();
    setExpandedNotification(
      expandedNotification === notificationId ? null : notificationId
    );
    markNotificationAsRead(notificationId);
  };

  const handleMarkAllAsRead = () => {
    if (user?._id) {
      setIsAnimating(true);
      markAllNotificationsAsRead(user._id).finally(() => {
        setTimeout(() => {
          setIsAnimating(false);
        }, 500);
      });
    }
  };

  const handleDeleteNotification = (
    e: React.MouseEvent,
    notificationId: string
  ) => {
    e.stopPropagation();
    const element = e.currentTarget.closest(
      ".notification-item"
    ) as HTMLElement;
    if (element) {
      element.style.height = `${element.offsetHeight}px`;
      element.classList.add("notification-exit");
      setTimeout(() => {
        if (user?._id) {
          removeNotification(notificationId, user._id);
        }
      }, 300);
    } else if (user?._id) {
      removeNotification(notificationId, user._id);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "like":
        return (
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-red-500 to-pink-600 text-white">
            <FaHeart className="text-white" />
          </div>
        );
      case "comment":
        return (
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 text-white">
            <FaComment className="text-white" />
          </div>
        );
      case "follow":
        return (
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-teal-500 text-white">
            <FaUserPlus className="text-white" />
          </div>
        );
      case "mention":
        return (
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-indigo-500 text-white">
            <FaAt className="text-white" />
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-gray-400 to-gray-600 text-white">
            <FaBell className="text-white" />
          </div>
        );
    }
  };

  const getNotificationTitle = (type: string) => {
    switch (type) {
      case "like":
        return "Liked your post";
      case "comment":
        return "Commented on your post";
      case "follow":
        return "Started following you";
      case "mention":
        return "Mentioned you";
      default:
        return "Notification";
    }
  };

  return (
    <div
      ref={notificationPanelRef}
      className={`fixed inset-y-0 bg-white shadow-xl transition-all duration-300 ease-in-out z-50 ${
        isOpen ? "right-20 w-80 md:w-96" : "-right-full w-0"
      } overflow-hidden flex flex-col`}
    >
      <div className="p-4 flex justify-between items-center mb-2 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800">Notifications</h2>
        <div className="flex items-center">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              disabled={isAnimating}
              className="mr-2 text-blue-500 hover:text-blue-700 transition-colors flex items-center text-sm"
              title="Mark all as read"
            >
              <FaCheckDouble className="mr-1" />
              <span className="hidden sm:inline">Mark all read</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
          >
            <FaTimes />
          </button>
        </div>
      </div>

      {loading && notifications.length === 0 ? (
        <div className="flex-grow flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex-grow flex flex-col justify-center items-center p-4">
          <div className="p-8 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-600/10 mb-6">
            <FaBell className="text-5xl text-gray-400" />
          </div>
          <p className="text-gray-600 text-center font-medium text-lg">
            No notifications yet
          </p>
          <p className="text-gray-400 text-sm text-center mt-2 max-w-xs">
            When you receive notifications from likes, comments, or new
            followers, they'll appear here
          </p>
        </div>
      ) : (
        <div className="flex-grow overflow-y-auto bg-gray-50">
          {error && (
            <div className="p-4 mb-2 bg-red-50 text-red-600 text-sm">
              {error}
            </div>
          )}
          <AnimatePresence>
            {notifications.map((notification) => (
              <motion.div
                key={notification._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{
                  opacity: 0,
                  y: -20,
                  height: 0,
                  marginTop: 0,
                  marginBottom: 0,
                  padding: 0,
                }}
                transition={{ duration: 0.3 }}
                data-notification-id={notification._id}
                onClick={() =>
                  handleNotificationClick(
                    notification._id,
                    notification.type,
                    notification.postId,
                    notification.senderId
                  )
                }
                className={`notification-item p-4 mb-2 mx-2 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-md relative group ${
                  !notification.read
                    ? "bg-white shadow-sm border-l-4 border-blue-500"
                    : "bg-white shadow-sm"
                } ${
                  expandedNotification === notification._id
                    ? "border border-blue-200"
                    : ""
                }`}
              >
                <div className="flex items-start">
                  <div
                    className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center mr-3 flex-shrink-0 cursor-pointer transition-transform duration-300 hover:scale-110 hover:shadow-md"
                    onClick={(e) =>
                      navigateToUserProfile(e, notification.senderId)
                    }
                  >
                    {notification.sender?.profilePicture ? (
                      <img
                        src={notification.sender.profilePicture}
                        alt={`${notification.sender.username}'s profile`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white text-lg font-bold">
                        {notification.sender?.username
                          .charAt(0)
                          .toUpperCase() || "U"}
                      </span>
                    )}
                  </div>

                  <div className="flex-grow mr-14">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mr-3 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div>
                        <p className="text-sm text-gray-800">
                          <span
                            className="font-semibold hover:text-blue-600 cursor-pointer"
                            onClick={(e) =>
                              navigateToUserProfile(e, notification.senderId)
                            }
                          >
                            {notification.sender?.username}
                          </span>{" "}
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {notification.createdAt &&
                            formatDistanceToNow(
                              new Date(notification.createdAt),
                              { addSuffix: true }
                            )}
                        </p>
                      </div>
                    </div>
                    {expandedNotification === notification._id &&
                      notification.postId && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-3 ml-11"
                        >
                          {postDetails[notification.postId]?.image ? (
                            <img
                              src={postDetails[notification.postId].image}
                              alt="Post"
                              className="w-full h-32 object-cover rounded-lg shadow-sm"
                              onClick={(e) =>
                                navigateToPost(
                                  e,
                                  notification.postId!,
                                  notification._id
                                )
                              }
                            />
                          ) : (
                            <div className="w-full h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                              <FaRegImage className="text-gray-400 text-xl" />
                              <span className="text-gray-400 text-sm ml-2">
                                Post image not available
                              </span>
                            </div>
                          )}
                        </motion.div>
                      )}
                  </div>

                  {notification.postId &&
                    postDetails[notification.postId]?.image && (
                      <div
                        className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0 transition-all duration-300 hover:scale-110 hover:shadow-md"
                        onClick={(e) =>
                          handlePostThumbnailClick(
                            e,
                            notification.postId as string,
                            notification._id
                          )
                        }
                      >
                        <img
                          src={postDetails[notification.postId].image}
                          alt="Post thumbnail"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                  <motion.button
                    whileHover={{ scale: 1.2, rotate: 15 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) =>
                      handleDeleteNotification(e, notification._id)
                    }
                    className="absolute right-2 top-2 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete notification"
                  >
                    <FaTrash size={14} />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <div className="p-3 bg-gray-50 text-center border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Tap a notification to expand details
        </p>
      </div>

      <style jsx>{`
        .notification-exit {
          animation: slideOut 0.3s forwards;
          overflow: hidden;
        }

        @keyframes slideOut {
          0% {
            opacity: 1;
            transform: translateX(0);
          }
          100% {
            opacity: 0;
            transform: translateX(100%);
            height: 0;
            margin: 0;
            padding: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default NotificationPanel;
