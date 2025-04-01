import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../store/AuthStore";
import { getTimelinePosts } from "../../api/Post";
import UserListModal from "../UserListModal"; // Folosim UserListModal direct
import axios from "axios";

const ProfileSide: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [postCount, setPostCount] = useState(0);
  const [isHoveringCover, setIsHoveringCover] = useState(false);
  const [isHoveringProfile, setIsHoveringProfile] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const [isFollowersModalOpen, setIsFollowersModalOpen] = useState(false);
  const [isFollowingModalOpen, setIsFollowingModalOpen] = useState(false);

  useEffect(() => {
    const fetchPostCount = async () => {
      if (user) {
        try {
          const posts = await getTimelinePosts(user._id);
          const userPosts = posts.filter((post) => post.userId === user._id);
          setPostCount(userPosts.length);
        } catch (error) {
          console.error("Error fetching post count:", error);
          setPostCount(0);
        }
      }
    };

    fetchPostCount();
  }, [user]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const fetchFollowers = async (page: number, limit: number) => {
    if (!user) return { users: [], hasMore: false };
    try {
      const startIndex = (page - 1) * limit;
      const endIndex = Math.min(startIndex + limit, user.followers.length);
      const followerIds = user.followers.slice(startIndex, endIndex);

      const followers = [];
      for (const followerId of followerIds) {
        try {
          const response = await axios.get(
            `http://localhost:5001/user/${followerId}`
          );
          if (response.data.success) followers.push(response.data.user);
        } catch (error) {
          console.error(`Error fetching follower ${followerId}:`, error);
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
    if (!user) return { users: [], hasMore: false };
    try {
      const startIndex = (page - 1) * limit;
      const endIndex = Math.min(startIndex + limit, user.following.length);
      const followingIds = user.following.slice(startIndex, endIndex);

      const followingUsers = [];
      for (const followingId of followingIds) {
        try {
          const response = await axios.get(
            `http://localhost:5001/user/${followingId}`
          );
          if (response.data.success) followingUsers.push(response.data.user);
        } catch (error) {
          console.error(`Error fetching following ${followingId}:`, error);
        }
      }

      return {
        users: followingUsers,
        hasMore: endIndex < user.following.length,
      };
    } catch (error) {
      console.error("Error fetching following:", error);
      return { users: [], hasMore: false };
    }
  };

  if (!user) {
    return (
      <div className="w-full bg-white rounded-xl shadow-xl overflow-hidden p-6">
        <p className="text-gray-500 text-center">Loading...</p>
      </div>
    );
  }

  return (
    <>
      <div
        className={`w-full bg-white rounded-xl shadow-xl overflow-hidden transition-all duration-500 ease-out transform ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <div
          className="h-32 bg-cover bg-center bg-gradient-to-r from-blue-500 to-purple-600 transition duration-300 ease-in-out"
          style={
            user.coverPicture
              ? { backgroundImage: `url(${user.coverPicture})` }
              : {}
          }
          onMouseEnter={() => setIsHoveringCover(true)}
          onMouseLeave={() => setIsHoveringCover(false)}
        ></div>

        <div className="px-6 py-5 relative">
          <div
            className="absolute -top-20 mt-5 left-1/2 transform -translate-x-1/2"
            onMouseEnter={() => setIsHoveringProfile(true)}
            onMouseLeave={() => setIsHoveringProfile(false)}
          >
            <div
              className={`w-36 h-36 rounded-full border-4 border-white overflow-hidden bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center shadow-lg transition-all duration-300 ease-in-out ${
                isHoveringProfile ? "scale-110" : ""
              } ${isHoveringCover ? "opacity-70" : "opacity-100"}`}
            >
              {user.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt={`${user.username}'s profile`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white text-3xl font-bold">
                  {user.username.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
          </div>

          <div className="mt-16 text-center">
            <h2 className="text-3xl font-bold text-gray-800">
              {user.username}
            </h2>
            <p className="text-gray-600">
              {user.firstname} {user.lastname}
            </p>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-4 border-t border-gray-200 pt-4">
            <div className="text-center">
              <p className="text-gray-500 text-sm">Posts</p>
              <p className="font-bold text-gray-800">{postCount}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-500 text-sm">Followers</p>
              <button
                onClick={() =>
                  user.followers.length > 0 && setIsFollowersModalOpen(true)
                }
                className={`font-bold ${
                  user.followers.length > 0
                    ? "text-blue-600 hover:text-blue-700 cursor-pointer"
                    : "text-gray-800 cursor-default"
                }`}
              >
                {user.followers.length}
              </button>
            </div>
            <div className="text-center">
              <p className="text-gray-500 text-sm">Following</p>
              <button
                onClick={() =>
                  user.following.length > 0 && setIsFollowingModalOpen(true)
                }
                className={`font-bold ${
                  user.following.length > 0
                    ? "text-blue-600 hover:text-blue-700 cursor-pointer"
                    : "text-gray-800 cursor-default"
                }`}
              >
                {user.following.length}
              </button>
            </div>
          </div>

          <button
            onClick={() => navigate("/profile")}
            className="w-full mt-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 rounded-lg hover:from-blue-600 hover:to-purple-600 transition duration-300"
          >
            My Profile
          </button>
        </div>
      </div>

      {/* Modale pentru Followers și Following */}
      <UserListModal
        isOpen={isFollowersModalOpen}
        onClose={() => setIsFollowersModalOpen(false)}
        title="Followers"
        fetchUsers={fetchFollowers}
        userId={user._id}
      />
      <UserListModal
        isOpen={isFollowingModalOpen}
        onClose={() => setIsFollowingModalOpen(false)}
        title="Following"
        fetchUsers={fetchFollowing}
        userId={user._id}
      />
    </>
  );
};

export default ProfileSide;
