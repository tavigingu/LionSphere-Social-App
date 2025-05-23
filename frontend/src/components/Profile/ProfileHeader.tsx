import React, { useState, useEffect } from "react";
import { IUser } from "../../types/AuthTypes";
import { FaPen, FaSignInAlt, FaUserPlus } from "react-icons/fa";
import { followUser, unfollowUser } from "../../api/User";
import useAuthStore from "../../store/AuthStore";
import useStoryStore from "../../store/StoryStore";
import { motion } from "framer-motion";
import EditProfileModal from "./EditProfileModal";
import UserListModal from "../UserListModal";
import axios from "axios";
import ReactDOM from "react-dom";
import { useNavigate } from "react-router-dom";

interface ProfileHeaderProps {
  user: IUser | null;
  isOwnProfile: boolean;
  postCount?: number;
  isFollowing?: boolean;
  onProfileUpdate?: (updatedUser: IUser) => void;
  onFollowToggle?: () => void;
  onStoryClick?: (storyGroupIndex: number) => void;
  isReadOnly?: boolean;
  onShowLoginPrompt?: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  user,
  isOwnProfile,
  postCount = 0,
  isFollowing: initialIsFollowing = false,
  onProfileUpdate,
  onFollowToggle,
  onStoryClick,
  isReadOnly = false,
  onShowLoginPrompt,
}) => {
  const { user: currentUser, updateUserProfile } = useAuthStore();
  const { storyGroups, fetchStories, setActiveStoryGroup } = useStoryStore();
  const [followLoading, setFollowLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [error, setError] = useState<string | null>(null);
  const [isHoveringCover, setIsHoveringCover] = useState(false);
  const [isHoveringProfile, setIsHoveringProfile] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isFollowersModalOpen, setIsFollowersModalOpen] = useState(false);
  const [isFollowingModalOpen, setIsFollowingModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?._id) {
      fetchStories(user._id);
      setIsFollowing(initialIsFollowing);
    }
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, [user, fetchStories, initialIsFollowing]);

  const userStoryGroup = storyGroups.find(
    (group) => group.userId === user?._id
  );
  const hasStory = !!userStoryGroup;
  const hasUnseenStories = userStoryGroup?.hasUnseenStories || false;

  const handleProfileClick = () => {
    if (!hasStory || !user?._id) return;
    const storyIndex = storyGroups.findIndex(
      (group) => group.userId === user._id
    );
    if (storyIndex !== -1) {
      setActiveStoryGroup(storyIndex);
      if (onStoryClick) {
        onStoryClick(storyIndex);
      }
    }
  };

  const handleEditProfile = () => {
    setIsEditModalOpen(true);
  };

  const handleFollow = async () => {
    if (isReadOnly) {
      if (onShowLoginPrompt) {
        onShowLoginPrompt();
      }
      return;
    }

    if (!currentUser || !user || followLoading) return;

    setFollowLoading(true);
    setError(null);

    try {
      if (isFollowing) {
        await unfollowUser(user._id, currentUser._id);
        updateUserProfile({
          ...currentUser,
          following: currentUser.following.filter((id) => id !== user._id),
        });
        setIsFollowing(false);
      } else {
        await followUser(user._id, currentUser._id);
        updateUserProfile({
          ...currentUser,
          following: [...currentUser.following, user._id],
        });
        setIsFollowing(true);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update follow status"
      );
    } finally {
      setFollowLoading(false);
    }
  };

  const handleOpenFollowersModal = () => {
    if (user?.followers && user.followers.length > 0) {
      setIsFollowersModalOpen(true);
    }
  };

  const handleOpenFollowingModal = () => {
    if (user?.following && user.following.length > 0) {
      setIsFollowingModalOpen(true);
    }
  };

  const fetchFollowers = async (page: number, limit: number) => {
    if (!user || !user.followers) {
      return { users: [], hasMore: false };
    }

    try {
      const startIndex = (page - 1) * limit;
      const endIndex = Math.min(startIndex + limit, user.followers.length);
      const paginatedIds = user.followers.slice(startIndex, endIndex);

      const followers = [];
      for (const followerId of paginatedIds) {
        try {
          const response = await axios.get(
            `http://localhost:5001/user/${followerId}`
          );
          if (response.data.success) {
            followers.push(response.data.user);
          }
        } catch (error) {
          console.error(
            `Failed to fetch follower data for ID ${followerId}:`,
            error
          );
        }
      }

      return {
        users: followers,
        hasMore: endIndex < user.followers.length,
      };
    } catch (error) {
      console.error("Error fetching followers:", error);
      return { users: [], hasMore: false };
    }
  };

  const fetchFollowing = async (page: number, limit: number) => {
    if (!user || !user.following) {
      return { users: [], hasMore: false };
    }

    try {
      const startIndex = (page - 1) * limit;
      const endIndex = Math.min(startIndex + limit, user.following.length);
      const paginatedIds = user.following.slice(startIndex, endIndex);

      const following = [];
      for (const followingId of paginatedIds) {
        try {
          const response = await axios.get(
            `http://localhost:5001/user/${followingId}`
          );
          if (response.data.success) {
            following.push(response.data.user);
          }
        } catch (error) {
          console.error(
            `Failed to fetch following data for ID ${followingId}:`,
            error
          );
        }
      }

      return {
        users: following,
        hasMore: endIndex < user.following.length,
      };
    } catch (error) {
      console.error("Error fetching following users:", error);
      return { users: [], hasMore: false };
    }
  };

  const containerClasses = `w-full lg:max-w-xl lg:ml-4 lg:mr-auto bg-white rounded-xl shadow-xl overflow-hidden mb-6 duration-400 hover:shadow-2xl transition-all ease-out ${
    isVisible
      ? "opacity-100 transform translate-y-0"
      : "opacity-0 transform -translate-y-8"
  }`;

  if (!user) {
    return (
      <div className="w-full lg:max-w-lg lg:mx-auto bg-white rounded-xl shadow-xl overflow-hidden mb-6 p-6 duration-300 hover:shadow-2xl opacity-0 animate-pulse">
        <div className="flex justify-center items-center h-40">
          <p className="text-gray-500">Loading user profile...</p>
        </div>
      </div>
    );
  }

  const renderUserListModal = () => {
    if (isFollowersModalOpen || isFollowingModalOpen) {
      return ReactDOM.createPortal(
        <>
          {isFollowersModalOpen && (
            <UserListModal
              isOpen={isFollowersModalOpen}
              onClose={() => setIsFollowersModalOpen(false)}
              title={`${user.username}'s Followers`}
              fetchUsers={fetchFollowers}
            />
          )}
          {isFollowingModalOpen && (
            <UserListModal
              isOpen={isFollowingModalOpen}
              onClose={() => setIsFollowingModalOpen(false)}
              title={`People ${user.username} Follows`}
              fetchUsers={fetchFollowing}
            />
          )}
        </>,
        document.body
      );
    }
    return null;
  };

  return (
    <div className={containerClasses}>
      <div
        className={`h-32 sm:h-48 bg-cover bg-center relative transition duration-500 ease-in-out ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
        style={
          user.coverPicture
            ? {
                backgroundImage: `url(${user.coverPicture})`,
              }
            : { background: "linear-gradient(to right, #3b82f6, #8b5cf6)" }
        }
        onMouseEnter={() => setIsHoveringCover(true)}
        onMouseLeave={() => setIsHoveringCover(false)}
      />

      <div className="px-4 sm:px-6 py-5 relative">
        <motion.div
          className={`absolute -top-16 sm:-top-20 left-4 sm:left-6 transition-all duration-1000 ease-out ${
            isVisible
              ? "opacity-100 transform translate-y-0"
              : "opacity-0 transform translate-y-6"
          }`}
          onMouseEnter={() => setIsHoveringProfile(true)}
          onMouseLeave={() => setIsHoveringProfile(false)}
          whileHover={{ scale: 1.05 }}
        >
          <button
            onClick={handleProfileClick}
            disabled={!hasStory}
            className="relative w-32 h-32 sm:w-40 sm:h-40"
          >
            {hasStory && hasUnseenStories && (
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500 via-purple-500 to-pink-500 p-[3px] animate-story-ring">
                <div className="w-full h-full rounded-full bg-white"></div>
              </div>
            )}
            {hasStory && !hasUnseenStories && (
              <div className="absolute inset-0 rounded-full border-[3px] border-gray-300 p-[2px]">
                <div className="w-full h-full rounded-full bg-white"></div>
              </div>
            )}
            <div
              className={`absolute inset-[4px] rounded-full overflow-hidden transition-all duration-300 ease-in-out ${
                isHoveringCover ? "opacity-70" : "opacity-100"
              }`}
            >
              {user.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt={`${user.username}'s profile`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                  <span className="text-white text-2xl sm:text-4xl font-bold">
                    {user.username?.charAt(0).toUpperCase() || "U"}
                  </span>
                </div>
              )}
            </div>
          </button>
        </motion.div>

        <div
          className={`mt-16 sm:mt-0 sm:ml-44 transition-all duration-700 ${
            isVisible
              ? "opacity-100 transform translate-x-0 delay-200"
              : "opacity-0 transform translate-x-8"
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
                {user.username}
              </h2>
              <p className="text-gray-600 text-sm sm:text-base">
                {user.firstname} {user.lastname}
              </p>
            </div>
            {isOwnProfile || currentUser?.role === "admin" ? (
              <button
                onClick={handleEditProfile}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg transition flex items-center text-sm sm:text-base"
              >
                <FaPen className="mr-1 sm:mr-2" /> Edit Profile
              </button>
            ) : (
              currentUser?.role !== "admin" && (
                <button
                  onClick={handleFollow}
                  disabled={followLoading}
                  className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-medium transition-colors text-sm sm:text-base ${
                    isFollowing
                      ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {followLoading ? (
                    <span className="flex items-center justify-center">
                      <div className="animate-spin h-4 w-4 mr-2 border-t-2 border-b-2 border-current rounded-full"></div>
                      Processing...
                    </span>
                  ) : isFollowing ? (
                    "Unfollow"
                  ) : (
                    "Follow"
                  )}
                </button>
              )
            )}
          </div>

          {error && (
            <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
              {error}
            </div>
          )}

          <div
            className={`mt-4 sm:mt-8 -ml-0 sm:-ml-40 px-0 sm:px-6 transition-all duration-700 ${
              isVisible
                ? "opacity-100 transform translate-y-0 delay-300"
                : "opacity-0 transform translate-y-4"
            }`}
          >
            <h4 className="text-sm sm:text-md font-semibold text-gray-700 mb-2">
              About
            </h4>
            {user.about ? (
              <p className="text-gray-700 text-sm sm:text-base">{user.about}</p>
            ) : (
              <p className="text-gray-500 italic text-sm sm:text-base">
                {isOwnProfile
                  ? "Add a bio to tell people more about yourself."
                  : "This user hasn't added a bio yet."}
              </p>
            )}
          </div>

          <div
            className={`mt-4 sm:mt-6 flex space-x-6 sm:space-x-8 ml-0 sm:ml-30 px-0 sm:px-6 transition-all duration-700 ${
              isVisible
                ? "opacity-100 transform translate-y-0 delay-400"
                : "opacity-0 transform translate-y-4"
            }`}
          >
            <div className="text-center">
              <p className="font-bold text-gray-800 text-sm sm:text-base">
                {postCount}
              </p>
              <p className="text-gray-500 text-xs sm:text-sm">Posts</p>
            </div>
            <div
              className={`text-center ${
                user.followers && user.followers.length > 0
                  ? "cursor-pointer group"
                  : ""
              }`}
              onClick={
                user.followers && user.followers.length > 0
                  ? handleOpenFollowersModal
                  : undefined
              }
            >
              <p className="font-bold text-gray-800 group-hover:text-blue-500 text-sm sm:text-base">
                {user.followers?.length || 0}
              </p>
              <p className="text-gray-500 text-xs sm:text-sm group-hover:text-blue-500">
                Followers
              </p>
            </div>
            <div
              className={`text-center ${
                user.following && user.following.length > 0
                  ? "cursor-pointer group"
                  : ""
              }`}
              onClick={
                user.following && user.following.length > 0
                  ? handleOpenFollowingModal
                  : undefined
              }
            >
              <p className="font-bold text-gray-800 group-hover:text-blue-500 text-sm sm:text-base">
                {user.following?.length || 0}
              </p>
              <p className="text-gray-500 text-xs sm:text-sm group-hover:text-blue-500">
                Following
              </p>
            </div>
          </div>
        </div>

        {renderUserListModal()}

        <style>
          {`
          @keyframes gradient-shift {
            0% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
            }
            100% {
              background-position: 0% 50%;
            }
          }

          .animate-story-ring {
            background-size: 300% 300%;
            animation: gradient-shift 4s ease infinite;
          }
        `}
        </style>

        {isEditModalOpen && (
          <EditProfileModal
            user={user}
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            onProfileUpdate={onProfileUpdate || (() => {})}
          />
        )}
      </div>
    </div>
  );
};

export default ProfileHeader;
