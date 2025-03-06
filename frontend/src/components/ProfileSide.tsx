import React, { useState, useEffect } from "react";
import useAuthStore from "../store/AuthStore";
import { getTimelinePosts } from "../api/Post";

const ProfileSide: React.FC = () => {
  const { user } = useAuthStore();
  const [postCount, setPostCount] = useState(0);

  // Fetch user's post count
  useEffect(() => {
    const fetchPostCount = async () => {
      if (user) {
        try {
          const posts = await getTimelinePosts(user._id);
          setPostCount(posts.length);
        } catch (error) {
          console.error("Error fetching post count:", error);
          setPostCount(0);
        }
      }
    };

    fetchPostCount();
  }, [user]);

  if (!user) {
    return (
      <div className="bg-white border-[1px] border-gray-200 p-6">
        <p className="text-gray-500 text-center">Loading...</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-xl shadow-xl overflow-hidden lg:ml-6">
      {/* Cover Image */}
      <div
        className="h-32 bg-cover bg-center"
        style={{ backgroundImage: `url(${user.coverPicture})` }}
      ></div>

      {/* Profile Information */}
      <div className="px-6 py-5 relative">
        {/* Profile Picture */}
        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2">
          <img
            src={user.profilePicture}
            alt={`${user.username}'s profile`}
            className="w-20 h-20 rounded-full border-4 border-white object-cover"
          />
        </div>

        {/* User Details */}
        <div className="mt-12 text-center">
          <h2 className="text-xl font-bold text-gray-800">{user.username}</h2>
          <p className="text-gray-600">
            {user.firstname} {user.lastname}
          </p>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-3 gap-4 border-t border-gray-200 pt-4">
          <div className="text-center">
            <p className="text-gray-500 text-sm">Posts</p>
            <p className="font-bold text-gray-800">{user.posts}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-500 text-sm">Followers</p>
            <p className="font-bold text-gray-800">{user.followers.length}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-500 text-sm">Following</p>
            <p className="font-bold text-gray-800">{user.following.length}</p>
          </div>
        </div>

        {/* Profile Button */}
        <button className="w-full mt-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 rounded-lg hover:from-blue-600 hover:to-purple-600 transition duration-300">
          My Profile
        </button>
      </div>
    </div>
  );
};

export default ProfileSide;
