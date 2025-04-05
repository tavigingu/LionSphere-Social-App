import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { IUser } from "../../types/AuthTypes";
import LocationSearchInput from "./LocationSearchInput";
import UserTaggingModal from "./UserTaggingModal";

interface EditPostStepProps {
  previewImage: string;
  imageRef: React.RefObject<HTMLImageElement>;
  description: string;
  setDescription: (value: string) => void;
  location: { name: string; coordinates?: { lat: number; lng: number } } | null;
  onLocationSelect: (location: {
    name: string;
    coordinates?: { lat: number; lng: number };
  }) => void;
  taggedUsers: {
    userId: string;
    username: string;
    position: { x: number; y: number };
  }[];
  onTagUser: (user: IUser, position: { x: number; y: number }) => void;
  onRemoveTag: (userId: string) => void;
  isSubmitting: boolean;
  error: string | null;
  onSubmit: () => void;
}

const EditPostStep: React.FC<EditPostStepProps> = ({
  previewImage,
  imageRef,
  description,
  setDescription,
  location,
  onLocationSelect,
  taggedUsers,
  onTagUser,
  onRemoveTag,
  isSubmitting,
  error,
  onSubmit,
}) => {
  const [showLocationSearch, setShowLocationSearch] = useState(false);
  const [taggingMode, setTaggingMode] = useState(false);
  const [taggingPosition, setTaggingPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [showTaggingModal, setShowTaggingModal] = useState(false);

  // Handle click on image for tagging users
  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!taggingMode || !imageRef.current) return;

    // Calculate position in percentage relative to the image
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setTaggingPosition({ x, y });
    setShowTaggingModal(true);
  };

  // Handle selecting a user to tag
  const handleSelectUserToTag = (user: IUser) => {
    if (taggingPosition) {
      onTagUser(user, taggingPosition);
      setShowTaggingModal(false);
      setTaggingMode(false);
    }
  };

  // Auto-detect hashtags in description
  const formatDescriptionWithHashtags = (text: string) => {
    return text.replace(/(#\w+)/g, '<span class="text-blue-600">$1</span>');
  };

  return (
    <div className="flex flex-col md:flex-row h-full">
      {/* Image section */}
      <div className="relative w-full md:w-3/5 bg-black flex items-center justify-center">
        <div className="relative max-h-[70vh] overflow-hidden">
          <img
            ref={imageRef}
            src={previewImage}
            alt="Preview"
            className="max-w-full max-h-[70vh] object-contain cursor-default"
            onClick={handleImageClick}
            style={{ cursor: taggingMode ? "crosshair" : "default" }}
          />

          {/* Tagged users markers */}
          {taggedUsers.map((taggedUser) => (
            <div
              key={taggedUser.userId}
              className="absolute w-6 h-6 -ml-3 -mt-3 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center text-white hover:bg-blue-600 cursor-pointer"
              style={{
                left: `${taggedUser.position.x}%`,
                top: `${taggedUser.position.y}%`,
              }}
              title={taggedUser.username}
            >
              <span className="text-xs text-gray-600">
                {taggedUser.username.charAt(0).toUpperCase()}
              </span>
            </div>
          ))}
        </div>

        {/* Tagging controls */}
        <div className="absolute bottom-4 left-4 flex gap-2">
          <button
            onClick={() => setTaggingMode(!taggingMode)}
            className={`p-2 rounded-full ${
              taggingMode
                ? "bg-blue-500 text-white"
                : "bg-white/80 text-gray-800 hover:bg-white"
            } shadow-md transition-colors`}
            title="Tag people"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Edit details section */}
      <div className="w-full md:w-2/5 border-l border-gray-200 flex flex-col h-full">
        <div className="p-6 flex-grow overflow-y-auto">
          {/* Description textarea */}
          <div className="mb-6">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Write a caption
            </label>
            <textarea
              id="description"
              rows={4}
              placeholder="Write a caption..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border  text-gray-600 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />

            {/* Hashtag preview */}
            {description.includes("#") && (
              <div className="mt-2 p-2 bg-gray-50 rounded-md">
                <p className="text-xs text-gray-500 mb-1">
                  Preview with hashtags:
                </p>
                <div
                  className="text-sm"
                  dangerouslySetInnerHTML={{
                    __html: formatDescriptionWithHashtags(description),
                  }}
                />
              </div>
            )}
          </div>

          {/* Location */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">
                Add location
              </label>
              <button
                onClick={() => setShowLocationSearch(!showLocationSearch)}
                className="text-blue-600 text-sm hover:text-blue-800 transition-colors"
              >
                {showLocationSearch ? "Cancel" : location ? "Change" : "Add"}
              </button>
            </div>

            {location && !showLocationSearch && (
              <div className="flex items-center p-2 bg-gray-50 rounded-md">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-500 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-gray-700">{location.name}</span>
                <button
                  onClick={() => onLocationSelect({ name: "" })}
                  className="ml-auto text-gray-500 hover:text-gray-700"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            )}

            {showLocationSearch && (
              <LocationSearchInput onSelect={onLocationSelect} />
            )}
          </div>

          {/* Tagged people */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">
                Tagged people
              </label>
              <button
                onClick={() => setTaggingMode(!taggingMode)}
                className="text-blue-600 text-sm hover:text-blue-800 transition-colors"
              >
                {taggingMode
                  ? "Cancel"
                  : taggedUsers.length > 0
                  ? "Add more"
                  : "Tag people"}
              </button>
            </div>

            {taggedUsers.length > 0 && (
              <div className="space-y-2">
                {taggedUsers.map((taggedUser) => (
                  <div
                    key={taggedUser.userId}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                  >
                    <span className="text-gray-700">
                      @{taggedUser.username}
                    </span>
                    <button
                      onClick={() => onRemoveTag(taggedUser.userId)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {taggingMode && (
              <p className="text-sm text-blue-600 mt-2">
                Click on the image to tag people
              </p>
            )}
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-3 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}
        </div>

        {/* Submit button */}
        <div className="p-6 border-t border-gray-200">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onSubmit}
            disabled={isSubmitting}
            className="w-full py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-md shadow-sm hover:shadow transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                <span>Posting...</span>
              </div>
            ) : (
              "Share"
            )}
          </motion.button>
        </div>

        {/* User tagging modal */}
        {showTaggingModal && taggingPosition && (
          <UserTaggingModal
            onClose={() => {
              setShowTaggingModal(false);
              setTaggingMode(false);
            }}
            onSelectUser={handleSelectUserToTag}
            position={taggingPosition}
          />
        )}
      </div>
    </div>
  );
};

export default EditPostStep;
