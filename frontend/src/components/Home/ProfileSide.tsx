import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../store/AuthStore";
import { getTimelinePosts } from "../../api/Post";

const ProfileSide: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [postCount, setPostCount] = useState(0);
  const [isHoveringCover, setIsHoveringCover] = useState(false);
  const [isHoveringProfile, setIsHoveringProfile] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Fetch user's post count
  useEffect(() => {
    const fetchPostCount = async () => {
      if (user) {
        try {
          const posts = await getTimelinePosts(user._id);
          // Filter only posts created by the current user
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

  // Animation on component mount
  useEffect(() => {
    // Delay pentru a crea efectul de secvență
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  if (!user) {
    return (
      <div className="w-full bg-white rounded-xl shadow-xl overflow-hidden p-6">
        <p className="text-gray-500 text-center">Loading...</p>
      </div>
    );
  }

  return (
    <div
      className={`w-full bg-white rounded-xl shadow-xl overflow-hidden transition-all duration-500 ease-out transform ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
    >
      {/* Cover Image */}
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

      {/* Profile Information */}
      <div className="px-6 py-5 relative">
        {/* Profile Picture with animation */}
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

        {/* User Details - Spațiere redusă */}
        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold text-gray-800">{user.username}</h2>
          <p className="text-gray-600">
            {user.firstname} {user.lastname}
          </p>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-3 gap-4 border-t border-gray-200 pt-4">
          <div className="text-center">
            <p className="text-gray-500 text-sm">Posts</p>
            <p className="font-bold text-gray-800">{postCount}</p>
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
        <button
          onClick={() => navigate("/profile")}
          className="w-full mt-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 rounded-lg hover:from-blue-600 hover:to-purple-600 transition duration-300"
        >
          My Profile
        </button>
      </div>
    </div>
  );
};

export default ProfileSide;
