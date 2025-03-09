import React from "react";
import { IUser } from "../../types/AuthTypes";

interface ProfileHeaderProps {
  user: IUser | null;
  isOwnProfile: boolean;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  user,
  isOwnProfile,
}) => {
  if (!user) {
    return (
      <div className="w-full bg-white rounded-xl shadow-xl overflow-hidden mb-6 p-6">
        <div className="flex justify-center items-center h-40">
          <p className="text-gray-500">Loading user profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-xl shadow-xl overflow-hidden mb-6">
      {/* Cover Image */}
      <div
        className="h-48 bg-cover bg-center bg-gradient-to-r from-blue-500 to-purple-600"
        style={
          user.coverPicture
            ? { backgroundImage: `url(${user.coverPicture})` }
            : {}
        }
      ></div>

      {/* Profile Information */}
      <div className="px-6 py-5 relative">
        {/* Profile Picture */}
        <div className="absolute -top-16 left-6">
          <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
            {user.profilePicture ? (
              <img
                src={user.profilePicture}
                alt={`${user.username}'s profile`}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-white text-4xl font-bold">
                {user.username?.charAt(0).toUpperCase() || "U"}
              </span>
            )}
          </div>
        </div>

        {/* User Details */}
        <div className="ml-36">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {user.username}
              </h2>
              <p className="text-gray-600">
                {user.firstname} {user.lastname}
              </p>
            </div>

            {isOwnProfile ? (
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition">
                Edit Profile
              </button>
            ) : (
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition">
                Follow
              </button>
            )}
          </div>

          {/* Bio section */}
          <div className="mt-4">
            {user.about ? (
              <p className="text-gray-700">{user.about}</p>
            ) : (
              <p className="text-gray-500 italic">
                {isOwnProfile
                  ? "Add a bio to tell people more about yourself."
                  : "This user hasn't added a bio yet."}
              </p>
            )}
          </div>

          {/* Stats */}
          <div className="mt-6 flex space-x-8">
            <div className="text-center">
              <p className="font-bold text-gray-800">
                {user.followers?.length || 0}
              </p>
              <p className="text-gray-500 text-sm">Followers</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-gray-800">
                {user.following?.length || 0}
              </p>
              <p className="text-gray-500 text-sm">Following</p>
            </div>
            {/* Posts count would be here if available in user object */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
