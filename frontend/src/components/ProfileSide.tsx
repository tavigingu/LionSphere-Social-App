import React, { useState, useEffect } from "react";
import useAuthStore from "../store/AuthStore";
import { getTimelinePosts } from "../api/Post";

const ProfileSide: React.FC = () => {
  const { user } = useAuthStore();
  const [postCount, setPostCount] = useState(0);
  const [isCoverHovered, setIsCoverHovered] = useState(false);

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
      <div className="w-full max-w-sm bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-2xl shadow-2xl p-6 border border-gray-800">
        <p className="text-white text-center">Încărcare...</p>
      </div>
    );
  }

  return (
    <div
      className="
          w-full
          max-w-md
          sm:max-w-lg
          lg:max-w-xl
          h-auto
          sm:min-h-[100px]
          lg:min-h-[100px]
          backdrop-blur-sm 
          bg-white/5 
          rounded-xl 
          shadow-lg 
          border 
          border-gray-800 
          overflow-hidden
      "
    >
      {/* Cover Picture */}
      <div
        className="
          h-30
          sm:h-36
          lg:h-40
          md:h-20
          bg-cover
          bg-center
          relative
        "
        style={{ backgroundImage: `url(${user.coverPicture})` }}
        onMouseEnter={() => setIsCoverHovered(true)}
        onMouseLeave={() => setIsCoverHovered(false)}
      />

      {/* Profile Details */}
      <div
        className="
          px-4
          sm:px-6
          pb-6 
          text-center
        "
      >
        {/* Profile Picture */}
        <div
          className="
            relative 
            -mt-10
            sm:-mt-14
            flex 
            justify-center
          "
        >
          <div
            className="
              w-20          // Width for mobile
              h-20          // Height for mobile
              sm:w-28       // Width for small screens and up
              sm:h-28       // Height for small screens and up
              rounded-full  // Ensures circular shape
              border-2
              p-0.5
              border-green-500 
              overflow-hidden
              transition-opacity 
              duration-300
            "
            style={{ opacity: isCoverHovered ? 0.5 : 1 }}
          >
            {user.profilePicture ? (
              <img
                src={user.profilePicture}
                alt="Profile"
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <div
                className="
                  w-full 
                  h-full 
                  bg-white 
                  flex 
                  items-center 
                  justify-center
                "
              >
                <span
                  className="
                    text-gray-400 
                    text-xs 
                    sm:text-sm
                  "
                >
                  No Image
                </span>
              </div>
            )}
          </div>
        </div>

        <h2
          className="
            text-xl 
            sm:text-2xl 
            font-bold 
            text-white 
            mt-2 
            sm:mt-4
          "
        >
          {user.username}
        </h2>
        <p
          className="
            text-sm 
            sm:text-base 
            text-gray-300
          "
        >
          {user.firstname} {user.lastname}
        </p>

        {/* Stats */}
        <div
          className="
            grid 
            grid-cols-3 
            justify-around 
            mt-4 
            sm:mt-8 
            border-t 
            border-gray-700 
            pt-4
          "
        >
          <div className="flex flex-col items-center">
            <p
              className="
                text-xs 
                sm:text-sm 
                text-gray-400
              "
            >
              Posts
            </p>
            <p
              className="
                text-base 
                sm:text-2xl 
                font-semibold 
                text-white
              "
            >
              {postCount}
            </p>
          </div>
          <div className="flex flex-col items-center">
            <p
              className="
                text-xs 
                sm:text-sm 
                text-gray-400
              "
            >
              Followers
            </p>
            <p
              className="
                text-base 
                sm:text-2xl 
                font-semibold 
                text-white
              "
            >
              {user.followers.length}
            </p>
          </div>
          <div className="flex flex-col items-center">
            <p
              className="
                text-xs 
                sm:text-sm 
                text-gray-400
              "
            >
              Following
            </p>
            <p
              className="
                text-base 
                sm:text-2xl 
                font-semibold 
                text-white
              "
            >
              {user.following.length}
            </p>
          </div>
        </div>

        {/* My Profile Button */}
        <button
          className="
            mt-4 
            sm:mt-8 
            w-full 
            bg-gradient-to-r 
            from-orange-500 
            via-amber-500 
            to-red-500 
            text-white 
            py-2 
            sm:py-4 
            rounded-lg 
            hover:from-orange-600 
            hover:via-amber-600 
            hover:to-red-600 
            transition-all 
            duration-300 
            shadow-md 
            text-sm 
            sm:text-base
          "
        >
          My Profile
        </button>
      </div>
    </div>
  );
};

export default ProfileSide;
