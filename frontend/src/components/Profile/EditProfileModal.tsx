import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { IUser } from "../../types/AuthTypes";
import { updateUser } from "../../api/User";
import uploadFile from "../../helpers/uploadFile";
import useAuthStore from "../../store/AuthStore";

interface EditProfileModalProps {
  user: IUser;
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdate: (updatedUser: IUser) => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  user,
  isOpen,
  onClose,
  onProfileUpdate,
}) => {
  const [formData, setFormData] = useState({
    firstname: user.firstname || "",
    lastname: user.lastname || "",
    username: user.username || "",
    email: user.email || "",
    about: user.about || "",
    worksAt: user.worksAt || "",
    occupation: user.occupation || "",
    city: user.city || "",
    instagram: user.instagram || "",
    facebook: user.facebook || "",
    linkedin: user.linkedin || "",
    github: user.github || "",
  });

  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(
    user.profilePicture || null
  );
  const [coverPreview, setCoverPreview] = useState<string | null>(
    user.coverPicture || null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<
    "general" | "work" | "social" | "appearance"
  >("general");

  const profileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    setFormData({
      firstname: user.firstname || "",
      lastname: user.lastname || "",
      username: user.username || "",
      email: user.email || "",
      about: user.about || "",
      worksAt: user.worksAt || "",
      occupation: user.occupation || "",
      city: user.city || "",
      instagram: user.instagram || "",
      facebook: user.facebook || "",
      linkedin: user.linkedin || "",
      github: user.github || "",
    });
    setProfilePreview(user.profilePicture || null);
    setCoverPreview(user.coverPicture || null);
  }, [user]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileImage(file);
      const reader = new FileReader();
      reader.onload = () => {
        setProfilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCoverImage(file);
      const reader = new FileReader();
      reader.onload = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChangeSection = (
    section: "general" | "work" | "social" | "appearance"
  ) => {
    setActiveSection(section);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const updatedData = { ...formData };
      if (profileImage) {
        const uploadResult = await uploadFile(profileImage);
        updatedData.profilePicture = uploadResult.secure_url;
      }
      if (coverImage) {
        const uploadResult = await uploadFile(coverImage);
        updatedData.coverPicture = uploadResult.secure_url;
      }
      const updatedUser = await updateUser(user._id, user._id, updatedData);
      useAuthStore.getState().updateUserProfile(updatedUser);
      onProfileUpdate(updatedUser);
      onClose();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "An error occurred while updating profile"
      );
    } finally {
      setLoading(false);
    }
  };

  const renderGeneralSection = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            First Name
          </label>
          <input
            type="text"
            name="firstname"
            value={formData.firstname}
            onChange={handleInputChange}
            className="w-full px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Last Name
          </label>
          <input
            type="text"
            name="lastname"
            value={formData.lastname}
            onChange={handleInputChange}
            className="w-full px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Username
        </label>
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleInputChange}
          className="w-full px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          className="w-full px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          About
        </label>
        <textarea
          name="about"
          value={formData.about}
          onChange={handleInputChange}
          rows={3}
          className="w-full px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <p className="text-xs text-gray-500 mt-1">
          Tell people a little about yourself
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Location
        </label>
        <input
          type="text"
          name="city"
          value={formData.city}
          onChange={handleInputChange}
          placeholder="City"
          className="w-full px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    </div>
  );

  const renderWorkSection = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Occupation
        </label>
        <input
          type="text"
          name="occupation"
          value={formData.occupation}
          onChange={handleInputChange}
          placeholder="What do you do?"
          className="w-full px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Works At
        </label>
        <input
          type="text"
          name="worksAt"
          value={formData.worksAt}
          onChange={handleInputChange}
          placeholder="Company or organization"
          className="w-full px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    </div>
  );

  const renderSocialSection = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Instagram
        </label>
        <div className="flex items-center">
          <span className="bg-gray-100 text-gray-600 px-2 py-2 rounded-l-lg border border-gray-300 text-sm">
            instagram.com/
          </span>
          <input
            type="text"
            name="instagram"
            value={formData.instagram}
            onChange={handleInputChange}
            placeholder="username"
            className="flex-1 px-3 py-2 rounded-r-lg bg-white border border-gray-300 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Facebook
        </label>
        <div className="flex items-center">
          <span className="bg-gray-100 text-gray-600 px-2 py-2 rounded-l-lg border border-gray-300 text-sm">
            facebook.com/
          </span>
          <input
            type="text"
            name="facebook"
            value={formData.facebook}
            onChange={handleInputChange}
            placeholder="username"
            className="flex-1 px-3 py-2 rounded-r-lg bg-white border border-gray-300 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          LinkedIn
        </label>
        <div className="flex items-center">
          <span className="bg-gray-100 text-gray-600 px-2 py-2 rounded-l-lg border border-gray-300 text-sm">
            linkedin.com/in/
          </span>
          <input
            type="text"
            name="linkedin"
            value={formData.linkedin}
            onChange={handleInputChange}
            placeholder="username"
            className="flex-1 px-3 py-2 rounded-r-lg bg-white border border-gray-300 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          GitHub
        </label>
        <div className="flex items-center">
          <span className="bg-gray-100 text-gray-600 px-2 py-2 rounded-l-lg border border-gray-300 text-sm">
            github.com/
          </span>
          <input
            type="text"
            name="github"
            value={formData.github}
            onChange={handleInputChange}
            placeholder="username"
            className="flex-1 px-3 py-2 rounded-r-lg bg-white border border-gray-300 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  );

  const renderAppearanceSection = () => (
    <div className="space-y-6">
      <div>
        <h4 className="font-medium text-gray-700 mb-2">Profile Picture</h4>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-16 sm:w-20 md:w-24 h-16 sm:h-20 md:h-24 rounded-full overflow-hidden border-2 border-gray-200 bg-white">
              {profilePreview ? (
                <img
                  src={profilePreview}
                  alt="Profile preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xl sm:text-2xl md:text-3xl">
                  {user.username?.charAt(0).toUpperCase() || "U"}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => profileInputRef.current?.click()}
              className="absolute bottom-0 right-0 bg-blue-600 text-white p-1 sm:p-1.5 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 sm:h-4 w-3 sm:w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </button>
          </div>
          <div>
            <button
              type="button"
              onClick={() => profileInputRef.current?.click()}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Change profile photo
            </button>
            <p className="text-xs text-gray-500 mt-1">
              JPG, PNG or GIF. Max 8MB.
            </p>
          </div>
        </div>
        <input
          type="file"
          ref={profileInputRef}
          onChange={handleProfileImageChange}
          accept="image/*"
          className="hidden"
        />
      </div>

      <div>
        <h4 className="font-medium text-gray-700 mb-2">Cover Photo</h4>
        <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-white h-24 sm:h-32 md:h-40">
          {coverPreview ? (
            <img
              src={coverPreview}
              alt="Cover preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 text-white opacity-70 text-sm sm:text-base">
              No cover photo
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-10 opacity-0 hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              className="bg-blue-600 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-md hover:bg-blue-700 transition-colors flex items-center text-sm sm:text-base"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 sm:h-4 w-4 sm:w-4 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z"
                  clipRule="evenodd"
                />
              </svg>
              Change Cover
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Cover photo should be at least 820px wide by 312px tall.
        </p>
        <input
          type="file"
          ref={coverInputRef}
          onChange={handleCoverImageChange}
          accept="image/*"
          className="hidden"
        />
      </div>
    </div>
  );

  return ReactDOM.createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-2 sm:p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50"
              onClick={onClose}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="relative bg-white rounded-xl shadow-xl w-full max-w-[95vw] sm:max-w-2xl md:max-w-3xl overflow-hidden z-[10000]"
              style={{ maxHeight: "90vh" }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-purple-600">
                <h2 className="text-lg sm:text-xl font-bold text-white">
                  Edit Profile
                </h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-white hover:text-gray-200 focus:outline-none"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 sm:h-6 w-5 sm:w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="flex flex-col sm:flex-row sm:h-[500px]">
                {/* Sidebar navigation (hidden on mobile, replaced with tabs) */}
                <div className="hidden sm:block w-48 sm:w-56 border-r border-gray-200 p-3 sm:p-4">
                  <nav className="space-y-1">
                    <button
                      type="button"
                      onClick={() => handleChangeSection("general")}
                      className={`w-full text-left px-3 py-2 rounded-md flex items-center text-sm sm:text-base ${
                        activeSection === "general"
                          ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 sm:h-5 w-4 sm:w-5 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      General
                    </button>

                    <button
                      type="button"
                      onClick={() => handleChangeSection("work")}
                      className={`w-full text-left px-3 py-2 rounded-md flex items-center text-sm sm:text-base ${
                        activeSection === "work"
                          ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 sm:h-5 w-4 sm:w-5 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                      Work
                    </button>

                    <button
                      type="button"
                      onClick={() => handleChangeSection("social")}
                      className={`w-full text-left px-3 py-2 rounded-md flex items-center text-sm sm:text-base ${
                        activeSection === "social"
                          ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 sm:h-5 w-4 sm:w-5 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                        />
                      </svg>
                      Social Links
                    </button>

                    <button
                      type="button"
                      onClick={() => handleChangeSection("appearance")}
                      className={`w-full text-left px-3 py-2 rounded-md flex items-center text-sm sm:text-base ${
                        activeSection === "appearance"
                          ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 sm:h-5 w-4 sm:w-5 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      Appearance
                    </button>
                  </nav>
                </div>

                {/* Mobile tabs navigation */}
                <div className="sm:hidden flex border-b border-gray-200 overflow-x-auto bg-gray-50">
                  <button
                    type="button"
                    onClick={() => handleChangeSection("general")}
                    className={`flex-1 px-2 py-2 text-sm ${
                      activeSection === "general"
                        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    General
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChangeSection("work")}
                    className={`flex-1 px-2 py-2 text-sm ${
                      activeSection === "work"
                        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    Work
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChangeSection("social")}
                    className={`flex-1 px-2 py-2 text-sm ${
                      activeSection === "social"
                        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    Social
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChangeSection("appearance")}
                    className={`flex-1 px-2 py-2 text-sm ${
                      activeSection === "appearance"
                        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    Appearance
                  </button>
                </div>

                {/* Main form area */}
                <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
                  {error && (
                    <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                      <p>{error}</p>
                    </div>
                  )}

                  <form ref={formRef} onSubmit={handleSubmit}>
                    {activeSection === "general" && renderGeneralSection()}
                    {activeSection === "work" && renderWorkSection()}
                    {activeSection === "social" && renderSocialSection()}
                    {activeSection === "appearance" &&
                      renderAppearanceSection()}

                    <div className="mt-6 flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 border-t border-gray-200 pt-4">
                      <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-md hover:from-blue-600 hover:to-purple-700 transition-colors flex items-center"
                      >
                        {loading ? (
                          <>
                            <svg
                              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Saving...
                          </>
                        ) : (
                          "Save Changes"
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default EditProfileModal;
