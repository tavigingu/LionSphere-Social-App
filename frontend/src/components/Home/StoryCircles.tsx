// frontend/src/components/Home/StoryCircles.tsx
import React, { useEffect, useRef, useState } from "react";
import { FaPlus } from "react-icons/fa";
import useAuthStore from "../../store/AuthStore";
import useStoryStore from "../../store/StoryStore";
import uploadFile from "../../helpers/uploadFile";
import { motion, AnimatePresence } from "framer-motion";

interface StoryCirclesProps {
  onCreateStory?: () => void;
}

const StoryCircles: React.FC<StoryCirclesProps> = ({ onCreateStory }) => {
  const { user } = useAuthStore();
  const { storyGroups, fetchStories, createStory, setActiveStoryGroup } =
    useStoryStore();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [hoveredStory, setHoveredStory] = useState<string | null>(null);

  useEffect(() => {
    if (user?._id) {
      fetchStories(user._id);
    }
  }, [user, fetchStories]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user?._id) return;

    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      // Upload image to Cloudinary
      const uploadResponse = await uploadFile(file);

      // Create the story
      await createStory({
        userId: user._id,
        image: uploadResponse.secure_url,
        caption: "", // Optional, could add an input for description
      });

      if (onCreateStory) {
        onCreateStory();
      }

      // Reload stories to include the new one
      fetchStories(user._id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload story");
      console.error("Error creating story:", err);
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleStoryClick = (index: number, groupId: string) => {
    console.log("Setting active story group:", index);
    console.log("Story group ID:", groupId);

    // Find the group index based on ID in case the order has changed
    const realIndex = storyGroups.findIndex(
      (group) => group.userId === groupId
    );
    if (realIndex !== -1) {
      setActiveStoryGroup(realIndex);
    } else {
      console.error("Could not find story group with ID:", groupId);
      setActiveStoryGroup(index); // Fallback to the provided index
    }
  };

  // Make sure the user's own stories are first, then sort by unseen/seen status
  const sortedGroups = [...storyGroups].sort((a, b) => {
    // Current user is always first
    if (a.userId === user?._id) return -1;
    if (b.userId === user?._id) return 1;

    // Then stories with unseen content
    if (a.hasUnseenStories && !b.hasUnseenStories) return -1;
    if (!a.hasUnseenStories && b.hasUnseenStories) return 1;

    // Finally, sort by timestamp (assuming the existing order reflects this)
    return 0;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl shadow-xl p-4 mb-6"
    >
      <h3 className="font-semibold text-gray-800 mb-4">Stories</h3>

      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm"
        >
          {error}
        </motion.div>
      )}

      <div className="flex overflow-x-auto space-x-3 pb-2 no-scrollbar">
        {/* Add Story button - only for current user */}
        {user && (
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex flex-col items-center min-w-[72px]"
          >
            <label className="cursor-pointer relative">
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center border-2 border-white shadow-sm">
                {isUploading ? (
                  <div className="animate-spin h-5 w-5 border-t-2 border-b-2 border-blue-500 rounded-full"></div>
                ) : (
                  <>
                    {user.profilePicture ? (
                      <div className="w-full h-full rounded-full overflow-hidden relative">
                        <img
                          src={user.profilePicture}
                          alt="Your profile"
                          className="w-full h-full object-cover filter grayscale opacity-60"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                          <FaPlus className="text-white text-lg" />
                        </div>
                      </div>
                    ) : (
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <FaPlus className="text-white text-xs" />
                      </div>
                    )}
                  </>
                )}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileSelect}
                disabled={isUploading}
              />
              {/* Indicator blue circle with plus */}
              <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center border-2 border-white">
                <FaPlus className="text-white text-xs" />
              </div>
            </label>
            <span className="mt-1 text-xs text-gray-700 font-medium">
              Add Story
            </span>
          </motion.div>
        )}

        {/* Story circles for each user */}
        {sortedGroups.map((group, index) => (
          <motion.div
            key={group.userId}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex flex-col items-center min-w-[72px]"
            onHoverStart={() => setHoveredStory(group.userId)}
            onHoverEnd={() => setHoveredStory(null)}
          >
            <button
              onClick={() => handleStoryClick(index, group.userId)}
              aria-label={`View ${group.username}'s story`}
              className="relative"
            >
              {/* Story Circle with Ring Indicator */}
              <div className={`relative w-16 h-16`}>
                {/* Gradient Ring for Unseen Stories */}
                {group.hasUnseenStories && (
                  <div
                    className="absolute inset-0 rounded-full bg-gradient-to-tr from-purple-500 via-pink-500 to-yellow-500"
                    style={{
                      padding: "2px",
                      animation: "rotate 4s linear infinite",
                    }}
                  >
                    <div className="w-full h-full rounded-full bg-white"></div>
                  </div>
                )}

                {/* Gray Ring for Seen Stories */}
                {!group.hasUnseenStories && (
                  <div className="absolute inset-0 rounded-full border-2 border-gray-300"></div>
                )}

                {/* Profile Picture */}
                <div
                  className={`absolute inset-0 m-0.5 rounded-full overflow-hidden ${
                    hoveredStory === group.userId
                      ? "scale-95 transition-transform duration-300"
                      : ""
                  }`}
                >
                  {group.profilePicture ? (
                    <img
                      src={group.profilePicture}
                      alt={`${group.username}'s profile`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                      <span className="text-white text-lg font-bold">
                        {group.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </button>
            <span className="mt-1 text-xs text-gray-700 font-medium truncate w-full text-center">
              {group.userId === user?._id ? "Your Story" : group.username}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Animation styles */}
      <style jsx>{`
        @keyframes rotate {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </motion.div>
  );
};

export default StoryCircles;
