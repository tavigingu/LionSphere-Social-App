import React, { useState, useEffect } from "react";
import { IUser } from "../../types/AuthTypes";
import { FaPen, FaTimes, FaCheck, FaCamera } from "react-icons/fa";
import { updateUser, followUser, unfollowUser } from "../../api/User";
import useAuthStore from "../../store/AuthStore";
import uploadFile from "../../helpers/uploadFile";

interface ProfileHeaderProps {
  user: IUser | null;
  isOwnProfile: boolean;
  postCount?: number;
  isFollowing?: boolean;
  onProfileUpdate?: (updatedUser: IUser) => void;
  onFollowToggle?: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  user,
  isOwnProfile,
  postCount = 0,
  isFollowing = false,
  onProfileUpdate,
  onFollowToggle,
}) => {
  const { user: currentUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState<
    "profile" | "cover" | null
  >(null);
  const [error, setError] = useState<string | null>(null);
  const [isHoveringCover, setIsHoveringCover] = useState(false);
  const [isHoveringProfile, setIsHoveringProfile] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const [formData, setFormData] = useState({
    firstname: user?.firstname || "",
    lastname: user?.lastname || "",
    about: user?.about || "",
    profilePicture: user?.profilePicture || "",
    coverPicture: user?.coverPicture || "",
  });

  // Trigger entrance animation after component mounts
  useEffect(() => {
    // Small delay for better perceived performance
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  if (!user) {
    return (
      <div className="w-full max-w-xl lg:mx-0 lg:ml-6 bg-white rounded-xl shadow-xl overflow-hidden mb-6 p-6 duration-300 hover:shadow-2xl opacity-0 animate-pulse">
        <div className="flex justify-center items-center h-40">
          <p className="text-gray-500">Loading user profile...</p>
        </div>
      </div>
    );
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "profile" | "cover"
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        setUploadingImage(type);
        const result = await uploadFile(file);
        setFormData({
          ...formData,
          [type === "profile" ? "profilePicture" : "coverPicture"]:
            result.secure_url,
        });
      } catch (err) {
        setError("Failed to upload image. Please try again.");
        console.error(err);
      } finally {
        setUploadingImage(null);
      }
    }
  };

  const handleSubmit = async () => {
    if (!currentUser?._id || !user?._id) return;

    setLoading(true);
    setError(null);

    try {
      const updatedUser = await updateUser(user._id, currentUser._id, {
        firstname: formData.firstname,
        lastname: formData.lastname,
        about: formData.about,
        profilePicture: formData.profilePicture,
        coverPicture: formData.coverPicture,
      });

      setIsEditing(false);

      if (onProfileUpdate) {
        onProfileUpdate(updatedUser);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!currentUser || !user || !onFollowToggle) return;

    setFollowLoading(true);
    try {
      if (isFollowing) {
        await unfollowUser(user._id, currentUser._id);
      } else {
        await followUser(user._id, currentUser._id);
      }
      // Call the callback to update parent component state
      onFollowToggle();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update follow status"
      );
    } finally {
      setFollowLoading(false);
    }
  };

  const cancelEdit = () => {
    setFormData({
      firstname: user.firstname || "",
      lastname: user.lastname || "",
      about: user.about || "",
      profilePicture: user.profilePicture || "",
      coverPicture: user.coverPicture || "",
    });
    setIsEditing(false);
    setError(null);
  };

  // Dynamic classes for entrance animation
  const containerClasses = `w-full max-w-xl lg:mx-0 bg-white rounded-xl shadow-xl overflow-hidden mb-6 duration-400 hover:shadow-2xl 
    ${
      isVisible
        ? "opacity-100 transform translate-y-0"
        : "opacity-0 transform -translate-y-8"
    } 
    transition-all ease-out`;

  return (
    <div className={containerClasses}>
      {/* Cover Image with Edit option */}
      <div
        className={`h-48 bg-cover bg-center relative transition duration-500 ease-in-out ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
        style={
          (isEditing ? formData.coverPicture : user.coverPicture)
            ? {
                backgroundImage: `url(${
                  isEditing ? formData.coverPicture : user.coverPicture
                })`,
              }
            : { background: "linear-gradient(to right, #3b82f6, #8b5cf6)" }
        }
        onMouseEnter={() => setIsHoveringCover(true)}
        onMouseLeave={() => setIsHoveringCover(false)}
      >
        {isEditing && (
          <div className="absolute bottom-4 right-4">
            <label className="cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-md hover:bg-gray-100 transition-colors">
                <FaCamera className="text-gray-700" />
              </div>
              <input
                type="file"
                className="hidden"
                onChange={(e) => handleFileChange(e, "cover")}
                accept="image/*"
              />
            </label>
          </div>
        )}

        {/* Editing controls for cover */}
        {isEditing && uploadingImage === "cover" && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
          </div>
        )}
      </div>

      {/* Profile Information */}
      <div className="px-6 py-5 relative">
        {/* Profile Picture */}
        <div
          className={`absolute -top-20 mt-5 left-6 transition-all duration-1000 ease-out 
            ${
              isVisible
                ? "opacity-100 transform translate-y-0"
                : "opacity-0 transform translate-y-6"
            }`}
          onMouseEnter={() => setIsHoveringProfile(true)}
          onMouseLeave={() => setIsHoveringProfile(false)}
        >
          <div
            className={`w-40 h-40 rounded-full border-4 border-white overflow-hidden relative transition-all duration-300 ease-in-out ${
              isHoveringProfile ? "scale-110 shadow-lg" : ""
            } ${isHoveringCover ? "opacity-70" : "opacity-100"}`}
          >
            {(isEditing ? formData.profilePicture : user.profilePicture) ? (
              <img
                src={isEditing ? formData.profilePicture : user.profilePicture}
                alt={`${user.username}'s profile`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                <span className="text-white text-4xl font-bold">
                  {user.username?.charAt(0).toUpperCase() || "U"}
                </span>
              </div>
            )}

            {/* Profile picture edit button */}
            {isEditing && (
              <label className="absolute bottom-0 right-0 cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-md hover:bg-gray-100 transition-colors">
                  <FaCamera className="text-gray-700 text-sm" />
                </div>
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, "profile")}
                  accept="image/*"
                />
              </label>
            )}

            {/* Loading indicator for profile picture upload */}
            {isEditing && uploadingImage === "profile" && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-full">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
              </div>
            )}
          </div>
        </div>

        {/* User Details - Adjusted margin to accommodate larger profile image */}
        <div
          className={`ml-44 -mt-1 transition-all duration-700 ${
            isVisible
              ? "opacity-100 transform translate-x-0 delay-200"
              : "opacity-0 transform translate-x-8"
          }`}
        >
          <div className="flex justify-between items-start">
            <div>
              {isEditing ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    name="firstname"
                    value={formData.firstname}
                    onChange={handleChange}
                    placeholder="First name"
                    className="px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition mr-2"
                  />
                  <input
                    type="text"
                    name="lastname"
                    value={formData.lastname}
                    onChange={handleChange}
                    placeholder="Last name"
                    className="px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                </div>
              ) : (
                <>
                  <h2 className="text-3xl font-bold text-gray-800">
                    {user.username}
                  </h2>
                  <p className="text-gray-600">
                    {user.firstname} {user.lastname}
                  </p>
                </>
              )}
            </div>

            {isEditing ? (
              <div className="flex space-x-2">
                <button
                  onClick={cancelEdit}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
                  title="Cancel"
                >
                  <FaTimes />
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className={`flex items-center justify-center w-10 h-10 rounded-full text-white ${
                    loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
                  } transition`}
                  title="Save changes"
                >
                  <FaCheck />
                </button>
              </div>
            ) : isOwnProfile ? (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 hover:bg-blue-700 mt-2 text-white px-4 py-2 rounded-lg transition flex items-center"
              >
                <FaPen className="mr-2" /> Edit Profile
              </button>
            ) : (
              <button
                onClick={handleFollowToggle}
                disabled={followLoading}
                className={`mt-2 px-4 py-2 rounded-lg font-medium transition-colors ${
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
            )}
          </div>

          {/* Error message */}
          {error && (
            <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
              {error}
            </div>
          )}

          {/* Bio section - Aligned with left edge */}
          <div
            className={`mt-8 -ml-40 px-6 transition-all duration-700 ${
              isVisible
                ? "opacity-100 transform translate-y-0 delay-300"
                : "opacity-0 transform translate-y-4"
            }`}
          >
            <h4 className="text-md font-semibold text-gray-700 mb-2">About</h4>
            {isEditing ? (
              <textarea
                name="about"
                value={formData.about}
                onChange={handleChange}
                placeholder="Write something about yourself..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                rows={3}
              />
            ) : user.about ? (
              <p className="text-gray-700">{user.about}</p>
            ) : (
              <p className="text-gray-500 italic">
                {isOwnProfile
                  ? "Add a bio to tell people more about yourself."
                  : "This user hasn't added a bio yet."}
              </p>
            )}
          </div>

          {/* Stats - Added post count */}
          <div
            className={`mt-6 flex space-x-8 ml-30 px-6 transition-all duration-700 ${
              isVisible
                ? "opacity-100 transform translate-y-0 delay-400"
                : "opacity-0 transform translate-y-4"
            }`}
          >
            <div className="text-center">
              <p className="font-bold text-gray-800">{postCount}</p>
              <p className="text-gray-500 text-sm">Posts</p>
            </div>
            <div className="text-center ">
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
