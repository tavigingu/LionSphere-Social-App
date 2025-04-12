import React, { useEffect, useRef, useState } from "react";
import { FaPlus } from "react-icons/fa";
import useAuthStore from "../../store/AuthStore";
import useStoryStore from "../../store/StoryStore";
import uploadFile from "../../helpers/uploadFile";
import { motion } from "framer-motion";

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
      className="bg-white rounded-lg shadow-md overflow-hidden mb-6 py-6 px-4"
    >
      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 p-2 bg-red-100 text-red-700 rounded-lg text-xs"
        >
          {error}
        </motion.div>
      )}

      <div className="flex overflow-x-auto space-x-3 pt-1 pb-0 no-scrollbar">
        {/* Add Story button - only for current user */}
        {user && (
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex flex-col items-center min-w-[72px]"
          >
            <label className="cursor-pointer relative">
              <div className="w-16 h-16 rounded-full flex items-center justify-center relative">
                {/* Background gradient ring */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500 via-purple-500 to-pink-500 p-[1.5px]">
                  <div className="w-full h-full rounded-full bg-white"></div>
                </div>

                {/* Image container */}
                <div className="absolute inset-[2px] rounded-full overflow-hidden z-10">
                  {isUploading ? (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <div className="animate-spin h-4 w-4 border-t-2 border-b-2 border-blue-500 rounded-full"></div>
                    </div>
                  ) : (
                    <>
                      {user.profilePicture ? (
                        <div className="w-full h-full relative">
                          <img
                            src={user.profilePicture}
                            alt="Your profile"
                            className="w-full h-full object-cover filter grayscale opacity-60"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                            <FaPlus className="text-white text-sm" />
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <FaPlus className="text-gray-500 text-lg" />
                        </div>
                      )}
                    </>
                  )}
                </div>
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
              <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center border-2 border-white z-20">
                <FaPlus className="text-white text-[10px]" />
              </div>
            </label>
            <span className="mt-2 text-xs text-gray-700 font-medium">
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
              {/* Story Circle with improved visual ring */}
              <div className="relative w-16 h-16">
                {/* Gradient Ring for Unseen Stories */}
                {group.hasUnseenStories && (
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500 via-purple-500 to-pink-500 p-[2px] animate-story-ring">
                    <div className="w-full h-full rounded-full bg-white"></div>
                  </div>
                )}

                {/* Gray Ring for Seen Stories */}
                {!group.hasUnseenStories && (
                  <div className="absolute inset-0 rounded-full border-[2px] border-gray-300 p-[1.5px]">
                    <div className="w-full h-full rounded-full bg-white"></div>
                  </div>
                )}

                {/* Profile Picture */}
                <div
                  className={`absolute inset-[2px] rounded-full overflow-hidden ${
                    hoveredStory === group.userId
                      ? "transform scale-105 transition-transform duration-300"
                      : "transition-transform duration-300"
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
                      <span className="text-white text-base font-bold">
                        {group.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </button>
            <span className="mt-2 text-xs text-gray-700 font-medium truncate w-full text-center">
              {group.userId === user?._id ? "Your Story" : group.username}
            </span>
          </motion.div>
        ))}
        {/* Empty placeholder when no stories */}
        {sortedGroups.length === 0 && !user && (
          <div className="flex-1 py-4 flex items-center justify-center">
            <p className="text-gray-400 text-xs">No stories to display</p>
          </div>
        )}
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

        .animate-story-ring {
          background-size: 300% 300%;
          animation: gradient-shift 4s ease infinite;
        }

        @keyframes gradient-shift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        /* Hide scrollbar but keep functionality */
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }

        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </motion.div>
  );
};

export default StoryCircles;
