// frontend/src/components/Home/StoryViewer.tsx
import React, { useEffect, useState, useRef } from "react";
import {
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaTrash,
} from "react-icons/fa";
import useStoryStore from "../../store/StoryStore";
import useAuthStore from "../../store/AuthStore";
import { formatDistanceToNow } from "date-fns";

const StoryViewer: React.FC = () => {
  const {
    activeStoryGroup,
    activeStoryIndex,
    closeStories,
    nextStory,
    prevStory,
    viewStory,
    deleteStory,
  } = useStoryStore();
  const { user } = useAuthStore();

  const [progress, setProgress] = useState(0);
  const progressIntervalRef = useRef<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const currentStory = activeStoryGroup?.stories[activeStoryIndex];
  const isOwnStory = user?._id === activeStoryGroup?.userId;

  // Handle view tracking and story navigation
  useEffect(() => {
    if (!activeStoryGroup || !currentStory || !user) return;

    // Mark story as viewed
    viewStory(currentStory._id, user._id);

    // Reset progress
    setProgress(0);

    // Start progress animation
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    const duration = 5000; // 5 seconds per story
    const interval = 100; // Update progress every 100ms
    const step = (interval / duration) * 100;

    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
          }
          // Automatically move to next story when progress completes
          nextStory();
          return 0;
        }
        return prev + step;
      });
    }, interval);

    // Cleanup on unmount or when changing stories
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [
    activeStoryGroup,
    activeStoryIndex,
    currentStory,
    user,
    viewStory,
    nextStory,
  ]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeStories();
      } else if (e.key === "ArrowLeft") {
        prevStory();
      } else if (e.key === "ArrowRight") {
        nextStory();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeStories, prevStory, nextStory]);

  // Handle window clicks to close
  useEffect(() => {
    const handleWindowClick = (e: MouseEvent) => {
      // Close stories when clicking outside the story container
      const storyContent = document.getElementById("story-content");
      if (storyContent && !storyContent.contains(e.target as Node)) {
        closeStories();
      }
    };

    window.addEventListener("click", handleWindowClick);
    return () => window.removeEventListener("click", handleWindowClick);
  }, [closeStories]);

  const handleDeleteStory = async () => {
    if (!currentStory || !user) return;

    setIsDeleting(true);
    try {
      await deleteStory(currentStory._id, user._id);
      // StoryStore will handle updating the UI
    } catch (error) {
      console.error("Failed to delete story:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!activeStoryGroup || !currentStory) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center">
      {/* Story container */}
      <div
        id="story-content"
        className="relative max-w-md w-full h-[80vh] max-h-[600px] bg-black overflow-hidden rounded-lg"
      >
        {/* Progress bar */}
        <div className="absolute top-0 left-0 right-0 z-10 flex space-x-1 p-2">
          {activeStoryGroup.stories.map((story, index) => (
            <div
              key={story._id}
              className="h-1 bg-gray-500 bg-opacity-50 flex-grow rounded-full overflow-hidden"
            >
              <div
                className={`h-full bg-white ${
                  index < activeStoryIndex
                    ? "w-full"
                    : index === activeStoryIndex
                    ? ""
                    : "w-0"
                }`}
                style={{
                  width:
                    index === activeStoryIndex ? `${progress}%` : undefined,
                }}
              ></div>
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-4 left-0 right-0 z-10 flex items-center justify-between px-4 pt-2">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white">
              {activeStoryGroup.profilePicture ? (
                <img
                  src={activeStoryGroup.profilePicture}
                  alt={`${activeStoryGroup.username}'s profile`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {activeStoryGroup.username.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <div className="ml-2 text-white">
              <p className="font-semibold">{activeStoryGroup.username}</p>
              <p className="text-xs opacity-80">
                {formatDistanceToNow(new Date(currentStory.createdAt), {
                  addSuffix: true,
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Delete button - only for own stories */}
            {isOwnStory && (
              <button
                onClick={handleDeleteStory}
                disabled={isDeleting}
                className="text-white p-2 rounded-full hover:bg-gray-800"
              >
                {isDeleting ? (
                  <div className="animate-spin h-5 w-5 border-t-2 border-b-2 border-white rounded-full"></div>
                ) : (
                  <FaTrash size={16} />
                )}
              </button>
            )}

            {/* Close button */}
            <button
              onClick={closeStories}
              className="text-white p-2 rounded-full hover:bg-gray-800"
            >
              <FaTimes size={20} />
            </button>
          </div>
        </div>

        {/* Story image */}
        <img
          src={currentStory.image}
          alt="Story"
          className="absolute inset-0 w-full h-full object-contain"
        />

        {/* Caption */}
        {currentStory.caption && (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
            <p className="text-white">{currentStory.caption}</p>
          </div>
        )}

        {/* Navigation buttons */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            prevStory();
          }}
          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 rounded-full p-2 text-white"
        >
          <FaChevronLeft size={20} />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            nextStory();
          }}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 rounded-full p-2 text-white"
        >
          <FaChevronRight size={20} />
        </button>

        {/* Viewers count for own stories */}
        {isOwnStory && (
          <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 rounded-full px-3 py-1 text-white text-sm">
            <span>{currentStory.viewers.length} views</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoryViewer;
