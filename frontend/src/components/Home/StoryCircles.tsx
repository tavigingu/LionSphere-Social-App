import React, { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import useAuthStore from "../../store/AuthStore";
import useStoryStore from "../../store/StoryStore";
import { motion } from "framer-motion";

interface StoryCirclesProps {
  onCreateStory?: () => void;
}

const StoryCircles: React.FC<StoryCirclesProps> = ({ onCreateStory }) => {
  const { user } = useAuthStore();
  const { storyGroups, fetchStories, setActiveStoryGroup } = useStoryStore();
  const [hoveredStory, setHoveredStory] = useState<string | null>(null);

  useEffect(() => {
    if (user?._id) {
      fetchStories(user._id);
    }
  }, [user, fetchStories]);

  const handleStoryClick = (index: number, groupId: string) => {
    const realIndex = storyGroups.findIndex(
      (group) => group.userId === groupId
    );
    if (realIndex !== -1) {
      setActiveStoryGroup(realIndex);
    } else {
      console.error("Could not find story group with ID:", groupId);
      setActiveStoryGroup(index);
    }
  };

  const sortedGroups = [...storyGroups].sort((a, b) => {
    if (a.userId === user?._id) return -1;
    if (b.userId === user?._id) return 1;
    if (a.hasUnseenStories && !b.hasUnseenStories) return -1;
    if (!a.hasUnseenStories && b.hasUnseenStories) return 1;
    return 0;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-lg shadow-md overflow-hidden mb-6 py-6 px-4"
    >
      <div className="flex overflow-x-auto space-x-3 pt-1 pb-0 no-scrollbar">
        {user && (
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex flex-col items-center min-w-[72px]"
          >
            <button
              onClick={onCreateStory} // Trigger callback to open StoryCreationForm
              className="cursor-pointer relative"
            >
              <div className="w-16 h-16 rounded-full flex items-center justify-center relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500 via-purple-500 to-pink-500 p-[1.5px]">
                  <div className="w-full h-full rounded-full bg-white"></div>
                </div>
                <div className="absolute inset-[2px] rounded-full overflow-hidden z-10">
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
                </div>
              </div>
              <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center border-2 border-white z-20">
                <FaPlus className="text-white text-[10px]" />
              </div>
            </button>
            <span className="mt-2 text-xs text-gray-700 font-medium">
              Add Story
            </span>
          </motion.div>
        )}
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
              <div className="relative w-16 h-16">
                {group.hasUnseenStories && (
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500 via-purple-500 to-pink-500 p-[2px] animate-story-ring">
                    <div className="w-full h-full rounded-full bg-white"></div>
                  </div>
                )}
                {!group.hasUnseenStories && (
                  <div className="absolute inset-0 rounded-full border-[2px] border-gray-300 p-[1.5px]">
                    <div className="w-full h-full rounded-full bg-white"></div>
                  </div>
                )}
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
        {sortedGroups.length === 0 && !user && (
          <div className="flex-1 py-4 flex items-center justify-center">
            <p className="text-gray-400 text-xs">No stories to display</p>
          </div>
        )}
      </div>

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
