import React, { useState } from "react";
import { IUser } from "../../types/AuthTypes";
import {
  FaBriefcase,
  FaMapMarkerAlt,
  FaGraduationCap,
  FaEnvelope,
  FaPen,
  FaTimes,
  FaCheck,
  FaInstagram,
  FaFacebook,
  FaLinkedin,
  FaGithub,
} from "react-icons/fa";
import { updateUser } from "../../api/User";
import useAuthStore from "../../store/AuthStore";

interface UserInfoSidebarProps {
  user: IUser | null;
  isOwnProfile: boolean;
  onProfileUpdate?: (updatedUser: IUser) => void;
}

const UserInfoSidebar: React.FC<UserInfoSidebarProps> = ({
  user,
  isOwnProfile,
  onProfileUpdate,
}) => {
  const { user: currentUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    city: user?.city || "",
    worksAt: user?.worksAt || "",
    occupation: user?.occupation || "",
    instagram: user?.instagram || "",
    facebook: user?.facebook || "",
    linkedin: user?.linkedin || "",
    github: user?.github || "",
  });

  if (!user) {
    return (
      <div className="w-full bg-white rounded-xl shadow-xl overflow-hidden p-6">
        <p className="text-gray-500 text-center">Loading user information...</p>
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

  const handleSubmit = async () => {
    if (!currentUser?._id || !user?._id) return;

    setLoading(true);
    setError(null);

    try {
      const updatedUser = await updateUser(user._id, currentUser._id, {
        city: formData.city,
        worksAt: formData.worksAt,
        occupation: formData.occupation,
        instagram: formData.instagram,
        facebook: formData.facebook,
        linkedin: formData.linkedin,
        github: formData.github,
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

  const cancelEdit = () => {
    setFormData({
      city: user.city || "",
      worksAt: user.worksAt || "",
      occupation: user.occupation || "",
      instagram: user.instagram || "",
      facebook: user.facebook || "",
      linkedin: user.linkedin || "",
      github: user.github || "",
    });
    setIsEditing(false);
    setError(null);
  };

  // Check if any information exists
  const hasDetails = user.worksAt || user.occupation || user.city || user.email;

  // Render edit form when editing is active
  if (isEditing) {
    return (
      <div className="w-full bg-white rounded-xl shadow-xl overflow-hidden p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800">Edit Profile</h3>
          <div className="flex space-x-2">
            <button
              onClick={cancelEdit}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
              title="Cancel"
            >
              <FaTimes />
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`p-2 text-white rounded-full ${
                loading ? "bg-blue-400" : "bg-blue-500 hover:bg-blue-600"
              }`}
              title="Save"
            >
              <FaCheck />
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaMapMarkerAlt className="text-gray-400" />
              </div>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="Your city"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Works At
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaBriefcase className="text-gray-400" />
              </div>
              <input
                type="text"
                name="worksAt"
                value={formData.worksAt}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="Your workplace"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Occupation
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaGraduationCap className="text-gray-400" />
              </div>
              <input
                type="text"
                name="occupation"
                value={formData.occupation}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="Your occupation"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <h4 className="font-medium text-gray-800 mb-3">Social Links</h4>

            <div className="space-y-3">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaInstagram className="text-gray-400" />
                </div>
                <input
                  type="text"
                  name="instagram"
                  value={formData.instagram}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder="Instagram username"
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaFacebook className="text-gray-400" />
                </div>
                <input
                  type="text"
                  name="facebook"
                  value={formData.facebook}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder="Facebook username or URL"
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLinkedin className="text-gray-400" />
                </div>
                <input
                  type="text"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder="LinkedIn username or URL"
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaGithub className="text-gray-400" />
                </div>
                <input
                  type="text"
                  name="github"
                  value={formData.github}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder="GitHub username"
                />
              </div>
            </div>
          </div>
        </form>
      </div>
    );
  }

  // Main display content
  return (
    <div className="w-full bg-white rounded-xl shadow-xl overflow-hidden p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800">Profile Info</h3>
        {isOwnProfile && (
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 text-blue-500 hover:text-blue-700 rounded-full hover:bg-blue-50 transition-colors"
            title="Edit profile"
          >
            <FaPen />
          </button>
        )}
      </div>

      {/* Progress Path for Work & Education */}
      <div className="relative mb-8">
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>

        {/* Email Info Point - Always show email */}
        <div className="relative z-10 flex mb-6">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              user.email ? "bg-blue-500" : "bg-gray-300"
            } mr-4`}
          >
            <FaEnvelope className="text-white text-sm" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-500">Email</p>
            <p className="text-gray-800 font-medium">{user.email}</p>
          </div>
        </div>

        {/* Location Info Point */}
        <div className="relative z-10 flex mb-6">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              user.city ? "bg-green-500" : "bg-gray-300"
            } mr-4`}
          >
            <FaMapMarkerAlt className="text-white text-sm" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-500">Location</p>
            {user.city ? (
              <p className="text-gray-800 font-medium">{user.city}</p>
            ) : (
              <p className="text-gray-400 italic">
                {isOwnProfile ? "Add your location" : "No location information"}
              </p>
            )}
          </div>
        </div>

        {/* Work Info Point */}
        <div className="relative z-10 flex mb-6">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              user.worksAt ? "bg-purple-500" : "bg-gray-300"
            } mr-4`}
          >
            <FaBriefcase className="text-white text-sm" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-500">Works at</p>
            {user.worksAt ? (
              <p className="text-gray-800 font-medium">{user.worksAt}</p>
            ) : (
              <p className="text-gray-400 italic">
                {isOwnProfile
                  ? "Add your workplace"
                  : "No workplace information"}
              </p>
            )}
          </div>
        </div>

        {/* Occupation Info Point */}
        <div className="relative z-10 flex">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              user.occupation ? "bg-yellow-500" : "bg-gray-300"
            } mr-4`}
          >
            <FaGraduationCap className="text-white text-sm" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-500">Occupation</p>
            {user.occupation ? (
              <p className="text-gray-800 font-medium">{user.occupation}</p>
            ) : (
              <p className="text-gray-400 italic">
                {isOwnProfile
                  ? "Add your occupation"
                  : "No occupation information"}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Social Media Section */}
      <div className="mt-8 pt-4 border-t border-gray-200">
        <h4 className="text-md font-semibold text-gray-700 mb-4">
          Social Media
        </h4>

        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>

          {/* Instagram */}
          <div className="relative z-10 flex mb-6">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                user.instagram
                  ? "bg-gradient-to-tr from-purple-600 to-pink-500"
                  : "bg-gray-300"
              } mr-4`}
            >
              <FaInstagram className="text-white text-sm" />
            </div>
            <div className="flex-1">
              {user.instagram ? (
                <a
                  href={`https://instagram.com/${user.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-800 font-medium hover:text-blue-600 transition-colors"
                >
                  @{user.instagram}
                </a>
              ) : (
                <p className="text-gray-400 italic">
                  {isOwnProfile
                    ? "Add your Instagram profile"
                    : "No Instagram profile"}
                </p>
              )}
            </div>
          </div>

          {/* Facebook */}
          <div className="relative z-10 flex mb-6">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                user.facebook ? "bg-blue-600" : "bg-gray-300"
              } mr-4`}
            >
              <FaFacebook className="text-white text-sm" />
            </div>
            <div className="flex-1">
              {user.facebook ? (
                <a
                  href={
                    user.facebook.startsWith("http")
                      ? user.facebook
                      : `https://facebook.com/${user.facebook}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-800 font-medium hover:text-blue-600 transition-colors"
                >
                  {user.facebook.includes("/")
                    ? user.facebook.split("/").pop()
                    : user.facebook}
                </a>
              ) : (
                <p className="text-gray-400 italic">
                  {isOwnProfile
                    ? "Add your Facebook profile"
                    : "No Facebook profile"}
                </p>
              )}
            </div>
          </div>

          {/* LinkedIn */}
          <div className="relative z-10 flex mb-6">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                user.linkedin ? "bg-blue-700" : "bg-gray-300"
              } mr-4`}
            >
              <FaLinkedin className="text-white text-sm" />
            </div>
            <div className="flex-1">
              {user.linkedin ? (
                <a
                  href={
                    user.linkedin.startsWith("http")
                      ? user.linkedin
                      : `https://linkedin.com/in/${user.linkedin}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-800 font-medium hover:text-blue-600 transition-colors"
                >
                  {user.linkedin.includes("/")
                    ? user.linkedin.split("/").pop()
                    : user.linkedin}
                </a>
              ) : (
                <p className="text-gray-400 italic">
                  {isOwnProfile
                    ? "Add your LinkedIn profile"
                    : "No LinkedIn profile"}
                </p>
              )}
            </div>
          </div>

          {/* GitHub */}
          <div className="relative z-10 flex">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                user.github ? "bg-gray-800" : "bg-gray-300"
              } mr-4`}
            >
              <FaGithub className="text-white text-sm" />
            </div>
            <div className="flex-1">
              {user.github ? (
                <a
                  href={`https://github.com/${user.github}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-800 font-medium hover:text-blue-600 transition-colors"
                >
                  {user.github}
                </a>
              ) : (
                <p className="text-gray-400 italic">
                  {isOwnProfile
                    ? "Add your GitHub profile"
                    : "No GitHub profile"}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Completeness section */}
      {isOwnProfile && (
        <div className="mt-8 pt-4 border-t border-gray-200">
          <div className="flex justify-between mb-2">
            <h4 className="text-md font-semibold text-gray-700">
              Profile Completeness
            </h4>
            <span className="text-sm font-medium text-blue-600">
              {calculateProfileCompleteness(user)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${calculateProfileCompleteness(user)}%` }}
            ></div>
          </div>
          {calculateProfileCompleteness(user) < 100 && (
            <p className="text-sm text-gray-500 mt-2">
              Complete your profile to help others connect with you better.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

// Calculate profile completeness (email, city, worksAt, occupation, desc, social media, etc.)
const calculateProfileCompleteness = (user: IUser): number => {
  const fields = [
    !!user.email,
    !!user.city,
    !!user.worksAt,
    !!user.occupation,
    !!user.about,
    !!user.instagram,
    !!user.facebook,
    !!user.linkedin,
    !!user.github,
    !!user.profilePicture,
    !!user.coverPicture,
  ];

  const filledFields = fields.filter(Boolean).length;
  return Math.round((filledFields / fields.length) * 100);
};

export default UserInfoSidebar;
