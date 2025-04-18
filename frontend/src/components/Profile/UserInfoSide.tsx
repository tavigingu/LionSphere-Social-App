import React, { useState, useEffect } from "react";
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

const UserInfoSide: React.FC<UserInfoSidebarProps> = ({
  user,
  isOwnProfile,
  onProfileUpdate,
}) => {
  const { user: currentUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hoveredIcon, setHoveredIcon] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [animateItems, setAnimateItems] = useState(false);

  const [formData, setFormData] = useState({
    city: user?.city || "",
    worksAt: user?.worksAt || "",
    occupation: user?.occupation || "",
    instagram: user?.instagram || "",
    facebook: user?.facebook || "",
    linkedin: user?.linkedin || "",
    github: user?.github || "",
  });

  useEffect(() => {
    const containerTimer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    const itemsTimer = setTimeout(() => {
      setAnimateItems(true);
    }, 300);

    return () => {
      clearTimeout(containerTimer);
      clearTimeout(itemsTimer);
    };
  }, []);

  if (!user) {
    return (
      <div className="w-full bg-white rounded-lg shadow-lg overflow-hidden p-4 opacity-0 animate-pulse">
        <p className="text-gray-500 text-center text-sm">Loading...</p>
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
      setError(err instanceof Error ? err.message : "Update error");
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

  const containerClasses = `w-full bg-white rounded-lg shadow-lg overflow-hidden p-4 transition-all duration-400 ease-out hover:shadow-xl ${
    isVisible
      ? "opacity-100 transform translate-x-0"
      : "opacity-0 transform translate-x-8"
  }`;

  if (isEditing) {
    return (
      <div className={containerClasses}>
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-bold text-gray-800">Edit Profile</h3>
          <div className="flex space-x-1">
            <button
              onClick={cancelEdit}
              className="p-1 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-all duration-300 transform hover:rotate-90"
              title="Cancel"
            >
              <FaTimes className="text-sm" />
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`p-1 text-white rounded-full transition-all duration-300 transform hover:scale-110 ${
                loading ? "bg-blue-400" : "bg-blue-500 hover:bg-blue-600"
              }`}
              title="Save"
            >
              <FaCheck className="text-sm" />
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-1 rounded mb-2 animate-pulse text-sm">
            {error}
          </div>
        )}

        <form className="space-y-2">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              City
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                <FaMapMarkerAlt className="text-gray-400 text-sm" />
              </div>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full pl-8 pr-2 py-1 text-gray-800 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-sm"
                placeholder="Your city"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Works at
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                <FaBriefcase className="text-gray-400 text-sm" />
              </div>
              <input
                type="text"
                name="worksAt"
                value={formData.worksAt}
                onChange={handleChange}
                className="w-full pl-8 pr-2 py-1 text-gray-800 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-sm"
                placeholder="Workplace"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Occupation
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                <FaGraduationCap className="text-gray-400 text-sm" />
              </div>
              <input
                type="text"
                name="occupation"
                value={formData.occupation}
                onChange={handleChange}
                className="w-full pl-8 pr-2 py-1 text-gray-800 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-sm"
                placeholder="Your occupation"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-gray-200">
            <h4 className="font-medium text-gray-800 mb-1 text-sm">
              Social Links
            </h4>

            <div className="space-y-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                  <FaInstagram className="text-gray-400 text-sm" />
                </div>
                <input
                  type="text"
                  name="instagram"
                  value={formData.instagram}
                  onChange={handleChange}
                  className="w-full pl-8 pr-2 py-1 text-gray-800 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-sm"
                  placeholder="Instagram"
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                  <FaFacebook className="text-gray-400 text-sm" />
                </div>
                <input
                  type="text"
                  name="facebook"
                  value={formData.facebook}
                  onChange={handleChange}
                  className="w-full pl-8 pr-2 py-1 text-gray-800 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-sm"
                  placeholder="Facebook"
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                  <FaLinkedin className="text-gray-400 text-sm" />
                </div>
                <input
                  type="text"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleChange}
                  className="w-full pl-8 pr-2 py-1 text-gray-800 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-sm"
                  placeholder="LinkedIn"
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                  <FaGithub className="text-gray-400 text-sm" />
                </div>
                <input
                  type="text"
                  name="github"
                  value={formData.github}
                  onChange={handleChange}
                  className="w-full pl-8 pr-2 py-1 text-gray-800 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-sm"
                  placeholder="GitHub"
                />
              </div>
            </div>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className={containerClasses}>
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-bold text-gray-800">Profile Information</h3>
        {(isOwnProfile || currentUser?.role === "admin") && (
          <button
            onClick={() => setIsEditing(true)}
            className="p-1 text-blue-500 hover:text-blue-700 rounded-full hover:bg-blue-50 transition-all duration-300 transform hover:rotate-90"
            title="Edit profile"
          >
            <FaPen className="text-sm" />
          </button>
        )}
      </div>

      <div className="relative mb-4">
        <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-200"></div>

        <div
          className={`relative z-10 flex mb-3 transition-all duration-500 transform delay-100 hover:translate-x-2 ${
            animateItems
              ? "opacity-100 translate-x-0"
              : "opacity-0 -translate-x-4"
          }`}
          onMouseEnter={() => setHoveredIcon("email")}
          onMouseLeave={() => setHoveredIcon(null)}
        >
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 mr-3 ${
              hoveredIcon === "email" ? "scale-110" : ""
            } ${user.email ? "bg-blue-500" : "bg-gray-300"}`}
          >
            <FaEnvelope
              className={`text-white text-xs ${
                hoveredIcon === "email" ? "animate-bounce" : ""
              }`}
            />
          </div>
          <div className="flex-1">
            <p className="text-xs text-gray-500">Email</p>
            <p className="text-gray-800 font-medium text-sm">{user.email}</p>
          </div>
        </div>

        <div
          className={`relative z-10 flex mb-3 transition-all duration-500 transform delay-200 hover:translate-x-2 ${
            animateItems
              ? "opacity-100 translate-x-0"
              : "opacity-0 -translate-x-4"
          }`}
          onMouseEnter={() => setHoveredIcon("location")}
          onMouseLeave={() => setHoveredIcon(null)}
        >
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 mr-3 ${
              hoveredIcon === "location" ? "scale-110" : ""
            } ${user.city ? "bg-green-500" : "bg-gray-300"}`}
          >
            <FaMapMarkerAlt
              className={`text-white text-xs ${
                hoveredIcon === "location" ? "animate-bounce" : ""
              }`}
            />
          </div>
          <div className="flex-1">
            <p className="text-xs text-gray-500">Location</p>
            {user.city ? (
              <p className="text-gray-800 font-medium text-sm">{user.city}</p>
            ) : (
              <p className="text-gray-400 italic text-sm">
                {isOwnProfile ? "Add location" : "No location"}
              </p>
            )}
          </div>
        </div>

        <div
          className={`relative z-10 flex mb-3 transition-all duration-500 transform delay-300 hover:translate-x-2 ${
            animateItems
              ? "opacity-100 translate-x-0"
              : "opacity-0 -translate-x-4"
          }`}
          onMouseEnter={() => setHoveredIcon("work")}
          onMouseLeave={() => setHoveredIcon(null)}
        >
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 mr-3 ${
              hoveredIcon === "work" ? "scale-110" : ""
            } ${user.worksAt ? "bg-purple-500" : "bg-gray-300"}`}
          >
            <FaBriefcase
              className={`text-white text-xs ${
                hoveredIcon === "work" ? "animate-bounce" : ""
              }`}
            />
          </div>
          <div className="flex-1">
            <p className="text-xs text-gray-500">Works at</p>
            {user.worksAt ? (
              <p className="text-gray-800 font-medium text-sm">
                {user.worksAt}
              </p>
            ) : (
              <p className="text-gray-400 italic text-sm">
                {isOwnProfile ? "Add workplace" : "No workplace"}
              </p>
            )}
          </div>
        </div>

        <div
          className={`relative z-10 flex transition-all duration-500 transform delay-400 hover:translate-x-2 ${
            animateItems
              ? "opacity-100 translate-x-0"
              : "opacity-0 -translate-x-4"
          }`}
          onMouseEnter={() => setHoveredIcon("occupation")}
          onMouseLeave={() => setHoveredIcon(null)}
        >
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 mr-3 ${
              hoveredIcon === "occupation" ? "scale-110" : ""
            } ${user.occupation ? "bg-yellow-500" : "bg-gray-300"}`}
          >
            <FaGraduationCap
              className={`text-white text-xs ${
                hoveredIcon === "occupation" ? "animate-bounce" : ""
              }`}
            />
          </div>
          <div className="flex-1">
            <p className="text-xs text-gray-500">Occupation</p>
            {user.occupation ? (
              <p className="text-gray-800 font-medium text-sm">
                {user.occupation}
              </p>
            ) : (
              <p className="text-gray-400 italic text-sm">
                {isOwnProfile ? "Add occupation" : "No occupation"}
              </p>
            )}
          </div>
        </div>
      </div>

      <div
        className={`mt-4 pt-2 border-t border-gray-200 transition-all duration-500 delay-500 ${
          animateItems
            ? "opacity-100 transform translate-y-0"
            : "opacity-0 transform translate-y-4"
        }`}
      >
        <h4 className="text-sm font-semibold text-gray-700 mb-2">
          Social Networks
        </h4>

        <div className="relative">
          <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-200"></div>

          <div
            className={`relative z-10 flex mb-3 transition-all duration-500 transform delay-600 hover:translate-x-2 ${
              animateItems
                ? "opacity-100 translate-x-0"
                : "opacity-0 -translate-x-4"
            }`}
            onMouseEnter={() => setHoveredIcon("instagram")}
            onMouseLeave={() => setHoveredIcon(null)}
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 mr-3 ${
                hoveredIcon === "instagram" ? "scale-110" : ""
              } ${
                user.instagram
                  ? "bg-gradient-to-tr from-purple-600 to-pink-500"
                  : "bg-gray-300"
              }`}
            >
              <FaInstagram
                className={`text-white text-xs ${
                  hoveredIcon === "instagram" ? "animate-bounce" : ""
                }`}
              />
            </div>
            <div className="flex-1">
              {user.instagram ? (
                <a
                  href={`https://instagram.com/${user.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-800 font-medium hover:text-blue-600 transition-colors text-sm"
                >
                  @{user.instagram}
                </a>
              ) : (
                <p className="text-gray-400 italic text-sm">
                  {isOwnProfile ? "Add Instagram" : "No Instagram"}
                </p>
              )}
            </div>
          </div>

          <div
            className={`relative z-10 flex mb-3 transition-all duration-500 transform delay-700 hover:translate-x-2 ${
              animateItems
                ? "opacity-100 translate-x-0"
                : "opacity-0 -translate-x-4"
            }`}
            onMouseEnter={() => setHoveredIcon("facebook")}
            onMouseLeave={() => setHoveredIcon(null)}
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 mr-3 ${
                hoveredIcon === "facebook" ? "scale-110" : ""
              } ${user.facebook ? "bg-blue-600" : "bg-gray-300"}`}
            >
              <FaFacebook
                className={`text-white text-xs ${
                  hoveredIcon === "facebook" ? "animate-bounce" : ""
                }`}
              />
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
                  className="text-gray-800 font-medium hover:text-blue-600 transition-colors text-sm"
                >
                  {user.facebook.includes("/")
                    ? user.facebook.split("/").pop()
                    : user.facebook}
                </a>
              ) : (
                <p className="text-gray-400 italic text-sm">
                  {isOwnProfile ? "Add Facebook" : "No Facebook"}
                </p>
              )}
            </div>
          </div>

          <div
            className={`relative z-10 flex mb-3 transition-all duration-500 transform delay-800 hover:translate-x-2 ${
              animateItems
                ? "opacity-100 translate-x-0"
                : "opacity-0 -translate-x-4"
            }`}
            onMouseEnter={() => setHoveredIcon("linkedin")}
            onMouseLeave={() => setHoveredIcon(null)}
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 mr-3 ${
                hoveredIcon === "linkedin" ? "scale-110" : ""
              } ${user.linkedin ? "bg-blue-700" : "bg-gray-300"}`}
            >
              <FaLinkedin
                className={`text-white text-xs ${
                  hoveredIcon === "linkedin" ? "animate-bounce" : ""
                }`}
              />
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
                  className="text-gray-800 font-medium hover:text-blue-600 transition-colors text-sm"
                >
                  {user.linkedin.includes("/")
                    ? user.linkedin.split("/").pop()
                    : user.linkedin}
                </a>
              ) : (
                <p className="text-gray-400 italic text-sm">
                  {isOwnProfile ? "Add LinkedIn" : "No LinkedIn"}
                </p>
              )}
            </div>
          </div>

          <div
            className={`relative z-10 flex transition-all duration-500 transform delay-900 hover:translate-x-2 ${
              animateItems
                ? "opacity-100 translate-x-0"
                : "opacity-0 -translate-x-4"
            }`}
            onMouseEnter={() => setHoveredIcon("github")}
            onMouseLeave={() => setHoveredIcon(null)}
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 mr-3 ${
                hoveredIcon === "github" ? "scale-110" : ""
              } ${user.github ? "bg-gray-800" : "bg-gray-300"}`}
            >
              <FaGithub
                className={`text-white text-xs ${
                  hoveredIcon === "github" ? "animate-bounce" : ""
                }`}
              />
            </div>
            <div className="flex-1">
              {user.github ? (
                <a
                  href={`https://github.com/${user.github}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-800 font-medium hover:text-blue-600 transition-colors text-sm"
                >
                  {user.github}
                </a>
              ) : (
                <p className="text-gray-400 italic text-sm">
                  {isOwnProfile ? "Add GitHub" : "No GitHub"}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {isOwnProfile && (
        <div
          className={`mt-4 pt-2 border-t border-gray-200 transition-all duration-500 delay-1000 ${
            animateItems
              ? "opacity-100 transform translate-y-0"
              : "opacity-0 transform translate-y-4"
          }`}
        >
          <div className="flex justify-between mb-1">
            <h4 className="text-sm font-semibold text-gray-700">
              Profile Completion
            </h4>
            <span className="text-xs font-medium text-blue-600">
              {calculateProfileCompleteness(user)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-blue-600 h-1.5 rounded-full transition-all duration-1500 ease-out"
              style={{ width: `${calculateProfileCompleteness(user)}%` }}
            ></div>
          </div>
          {calculateProfileCompleteness(user) < 100 && (
            <p className="text-xs text-gray-500 mt-1">
              Complete your profile to connect with others more easily.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

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

export default UserInfoSide;
