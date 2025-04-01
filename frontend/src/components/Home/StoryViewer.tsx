import React, { useEffect, useState, useRef } from "react";
import {
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaTrash,
  FaPlay,
  FaPause,
  FaEllipsisH,
} from "react-icons/fa";
import { IoEyeOutline, IoHeartSharp } from "react-icons/io5";
import useStoryStore from "../../store/StoryStore";
import useAuthStore from "../../store/AuthStore";
import { formatDistanceToNow } from "date-fns";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { IStoryGroup } from "../../types/StoryTypes";
import { useNavigate } from "react-router-dom";

const StoryViewer: React.FC = () => {
  const navigate = useNavigate();
  const {
    activeStoryGroup,
    activeStoryIndex,
    storyGroups,
    closeStories,
    nextStory,
    prevStory,
    viewStory,
    deleteStory,
    setActiveStoryIndex,
    setActiveStoryGroup,
    likeStory,
    getStoryLikes,
  } = useStoryStore();
  const { user } = useAuthStore();

  const [progress, setProgress] = useState<number>(0);
  const progressIntervalRef = useRef<number | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [showViewers, setShowViewers] = useState<boolean>(false);
  const [viewers, setViewers] = useState<
    Array<{
      _id: string;
      username: string;
      profilePicture?: string;
      hasLiked?: boolean;
    }>
  >([]);
  const [viewersLoading, setViewersLoading] = useState<boolean>(false);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [storyLikes, setStoryLikes] = useState<string[]>([]);
  const [reactionAnimating, setReactionAnimating] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [longPressActive, setLongPressActive] = useState<boolean>(false);
  const longPressTimer = useRef<number | null>(null);
  const [isClosing, setIsClosing] = useState<boolean>(false);
  const [isEntering, setIsEntering] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [showOptions, setShowOptions] = useState<boolean>(false);

  // Flag to prevent multiple calls to viewStory
  const isViewMarked = useRef<boolean>(false);

  // Refs to handle story navigation
  const currentStory = activeStoryGroup?.stories[activeStoryIndex];
  const isOwnStory = user?._id === activeStoryGroup?.userId;

  // Find current group index
  const currentGroupIndex = storyGroups.findIndex(
    (group) => group.userId === activeStoryGroup?.userId
  );

  // Get previous and next groups for preview
  const prevGroup =
    currentGroupIndex > 0 ? storyGroups[currentGroupIndex - 1] : null;
  const nextGroup =
    currentGroupIndex < storyGroups.length - 1
      ? storyGroups[currentGroupIndex + 1]
      : null;

  // Set entering state on initial render
  useEffect(() => {
    setIsEntering(true);
    setTimeout(() => setIsEntering(false), 300);
    return () => setIsEntering(false);
  }, []);

  // Effect to load viewers with actual data
  useEffect(() => {
    if (isOwnStory && currentStory && showViewers) {
      setViewersLoading(true);

      const fetchViewers = async () => {
        try {
          // Filter out self-views (don't include the current user)
          const uniqueViewerIds = [...new Set(currentStory.viewers)].filter(
            (id) => id !== user?._id
          );

          const viewerProfiles = [];

          // Get the real likes from the story
          const realLikes = currentStory.likes || [];
          setStoryLikes(realLikes);

          for (const viewerId of uniqueViewerIds) {
            try {
              const userResponse = await axios.get(
                `http://localhost:5001/user/${viewerId}`
              );

              if (userResponse.data.success) {
                // Check if this user has liked the story
                const hasLiked = realLikes.includes(viewerId);

                viewerProfiles.push({
                  _id: viewerId,
                  username: userResponse.data.user.username,
                  profilePicture: userResponse.data.user.profilePicture,
                  hasLiked, // Set the like status
                });
              }
            } catch (error) {
              console.error("Error fetching viewer info:", error);
            }
          }

          setViewers(viewerProfiles);
          setViewersLoading(false);
        } catch (error) {
          console.error("Error fetching viewers:", error);
          setViewersLoading(false);
        }
      };

      fetchViewers();
    }
  }, [currentStory, showViewers, isOwnStory, user?._id]);

  // Handle view tracking and story progress
  useEffect(() => {
    if (!activeStoryGroup || !currentStory || !user) {
      return;
    }

    // Mark story as viewed - only once per story view
    if (!isViewMarked.current) {
      viewStory(currentStory._id, user._id);
      isViewMarked.current = true;
    }

    // Check if the current user has liked this story
    setIsLiked(currentStory.likes?.includes(user._id) || false);

    // Reset progress
    setProgress(0);

    // Reset paused state when story changes
    setIsPaused(false);

    // Clear any existing interval
    if (progressIntervalRef.current) {
      window.clearInterval(progressIntervalRef.current);
    }

    // Function to start progress animation
    const startProgressTimer = () => {
      const duration = 5000; // 5 seconds per story
      const interval = 16; // Update frequently for smooth animation
      const step = (interval / duration) * 100;

      progressIntervalRef.current = window.setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            if (progressIntervalRef.current) {
              window.clearInterval(progressIntervalRef.current);
            }
            // Automatically move to next story
            nextStory();
            return 0;
          }
          return prev + step;
        });
      }, interval) as unknown as number;
    };

    // Only start timer if not paused
    if (!isPaused) {
      startProgressTimer();
    }

    // Cleanup
    return () => {
      if (progressIntervalRef.current) {
        window.clearInterval(progressIntervalRef.current);
      }
    };
  }, [
    activeStoryGroup?.userId,
    activeStoryIndex,
    currentStory?._id,
    user?._id,
    viewStory,
    nextStory,
    isPaused,
  ]);

  // Reset view marker when changing stories
  useEffect(() => {
    isViewMarked.current = false;
  }, [currentStory?._id]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      } else if (e.key === "ArrowLeft") {
        prevStory();
      } else if (e.key === "ArrowRight") {
        nextStory();
      } else if (e.key === " ") {
        // Space bar toggles pause
        togglePause();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeStories, prevStory, nextStory]);

  // Handle long press to pause
  const handleLongPressStart = () => {
    longPressTimer.current = window.setTimeout(() => {
      setLongPressActive(true);
      setIsPaused(true);
      if (progressIntervalRef.current) {
        window.clearInterval(progressIntervalRef.current);
      }
    }, 200) as unknown as number;
  };

  const handleLongPressEnd = () => {
    if (longPressTimer.current) {
      window.clearTimeout(longPressTimer.current);
    }
    if (longPressActive) {
      setLongPressActive(false);
      setIsPaused(false);

      // Restart progress
      const duration = 5000; // 5 seconds per story
      const interval = 16;
      const step = (interval / duration) * 100;

      progressIntervalRef.current = window.setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            if (progressIntervalRef.current) {
              window.clearInterval(progressIntervalRef.current);
            }
            nextStory();
            return 0;
          }
          return prev + step;
        });
      }, interval) as unknown as number;
    }
  };

  // Toggle pause/play
  const togglePause = () => {
    setIsPaused(!isPaused);

    if (!isPaused) {
      // Pause progress
      if (progressIntervalRef.current) {
        window.clearInterval(progressIntervalRef.current);
      }
    } else {
      // Resume progress
      const duration = 5000;
      const interval = 16;
      const step = (interval / duration) * 100;

      progressIntervalRef.current = window.setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            if (progressIntervalRef.current) {
              window.clearInterval(progressIntervalRef.current);
            }
            nextStory();
            return 0;
          }
          return prev + step;
        });
      }, interval) as unknown as number;
    }
  };

  // Handle click on middle of screen (toggle pause)
  const handleScreenClick = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const third = innerWidth / 3;

    // Prevent navigation when clicking on any interactive elements
    if ((e.target as HTMLElement).closest(".story-interactive-element")) {
      return;
    }

    // Divide screen into thirds for navigation
    if (clientX < third) {
      prevStory();
    } else if (clientX > third * 2) {
      nextStory();
    } else {
      // Middle third toggles pause
      togglePause();
    }
  };

  // Handle deletion of a story
  const handleDeleteStory = async () => {
    if (!currentStory || !user) return;

    setIsDeleting(true);
    try {
      await deleteStory(currentStory._id, user._id);
    } catch (error) {
      console.error("Failed to delete story:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Toggle viewers panel
  const handleToggleViewers = () => {
    setShowViewers(!showViewers);
  };

  // Handle story like with real API
  const handleLikeStory = async () => {
    if (!currentStory || !user) return;

    // Optimistically update UI
    setIsLiked(!isLiked);

    // Show heart animation
    setReactionAnimating(true);
    setTimeout(() => {
      setReactionAnimating(false);
    }, 1000);

    try {
      // Call the actual API
      await likeStory(currentStory._id, user._id);
    } catch (error) {
      // Revert UI on error
      setIsLiked(isLiked);
      console.error("Error liking/unliking story:", error);
    }
  };

  // Navigate to the profile of a viewer
  const navigateToViewerProfile = (userId: string) => {
    navigate(`/profile/${userId}`);
    handleClose();
  };

  // Close the viewer
  const handleClose = () => {
    setIsClosing(true);

    // Clear all timers and intervals
    if (progressIntervalRef.current) {
      window.clearInterval(progressIntervalRef.current);
    }
    if (longPressTimer.current) {
      window.clearTimeout(longPressTimer.current);
    }

    setTimeout(() => {
      closeStories();
    }, 300);
  };

  // Switch to another user's stories
  const switchToGroup = (group: IStoryGroup) => {
    const groupIndex = storyGroups.findIndex((g) => g.userId === group.userId);
    if (groupIndex !== -1) {
      setActiveStoryGroup(groupIndex);
    }
  };

  // Format time for display
  const calculateTimeAgo = (timestamp: string) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

  if (!activeStoryGroup || !currentStory) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isClosing ? 0 : 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.9)",
        zIndex: 10000,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backdropFilter: "blur(10px)",
      }}
      onClick={handleScreenClick}
      onPointerDown={handleLongPressStart}
      onPointerUp={handleLongPressEnd}
      onPointerLeave={handleLongPressEnd}
    >
      {/* Story navigation controls - previous user's story preview */}
      {prevGroup && (
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 0.7, x: 0 }}
          className="story-interactive-element"
          style={{
            position: "absolute",
            left: "20px",
            height: "60%",
            width: "70px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            zIndex: 11,
          }}
          whileHover={{ opacity: 1, scale: 1.05 }}
          onClick={(e) => {
            e.stopPropagation();
            switchToGroup(prevGroup);
          }}
        >
          <FaChevronLeft
            size={24}
            color="white"
            style={{ marginBottom: "20px" }}
          />
          <div
            style={{
              width: "50px",
              height: "80px",
              borderRadius: "8px",
              overflow: "hidden",
              border: "2px solid white",
              marginBottom: "10px",
              position: "relative",
            }}
          >
            {/* Preview of previous user's story */}
            {prevGroup.stories[0]?.image && (
              <img
                src={prevGroup.stories[0].image}
                alt="Previous story"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  filter: "brightness(0.7)",
                }}
              />
            )}
          </div>
          <div
            style={{
              width: "30px",
              height: "30px",
              borderRadius: "50%",
              overflow: "hidden",
              border: "2px solid white",
              marginBottom: "5px",
            }}
          >
            {prevGroup.profilePicture ? (
              <img
                src={prevGroup.profilePicture}
                alt="Previous user"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  background: "linear-gradient(to right, #3b82f6, #8b5cf6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontWeight: "bold",
                  fontSize: "12px",
                }}
              >
                {prevGroup.username.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <p style={{ color: "white", fontSize: "12px", marginTop: "5px" }}>
            {prevGroup.username}
          </p>
        </motion.div>
      )}

      {/* Next user's story preview */}
      {nextGroup && (
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 0.7, x: 0 }}
          className="story-interactive-element"
          style={{
            position: "absolute",
            right: "20px",
            height: "60%",
            width: "70px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            zIndex: 11,
          }}
          whileHover={{ opacity: 1, scale: 1.05 }}
          onClick={(e) => {
            e.stopPropagation();
            switchToGroup(nextGroup);
          }}
        >
          <FaChevronRight
            size={24}
            color="white"
            style={{ marginBottom: "20px" }}
          />
          <div
            style={{
              width: "50px",
              height: "80px",
              borderRadius: "8px",
              overflow: "hidden",
              border: "2px solid white",
              marginBottom: "10px",
              position: "relative",
            }}
          >
            {/* Preview of next user's story */}
            {nextGroup.stories[0]?.image && (
              <img
                src={nextGroup.stories[0].image}
                alt="Next story"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  filter: "brightness(0.7)",
                }}
              />
            )}
          </div>
          <div
            style={{
              width: "30px",
              height: "30px",
              borderRadius: "50%",
              overflow: "hidden",
              border: "2px solid white",
              marginBottom: "5px",
            }}
          >
            {nextGroup.profilePicture ? (
              <img
                src={nextGroup.profilePicture}
                alt="Next user"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  background: "linear-gradient(to right, #3b82f6, #8b5cf6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontWeight: "bold",
                  fontSize: "12px",
                }}
              >
                {nextGroup.username.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <p style={{ color: "white", fontSize: "12px", marginTop: "5px" }}>
            {nextGroup.username}
          </p>
        </motion.div>
      )}

      {/* Main story container */}
      <motion.div
        className="story-interactive-element"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{
          scale: isClosing ? 0.9 : isEntering ? 1 : longPressActive ? 0.95 : 1,
          opacity: isClosing ? 0 : 1,
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
        }}
        style={{
          position: "relative",
          width: "90%",
          maxWidth: "400px",
          height: "80vh",
          maxHeight: "700px",
          backgroundColor: "#000",
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
        }}
      >
        {/* Progress bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            padding: "12px",
            zIndex: 10,
            display: "flex",
            gap: "4px",
          }}
          className="story-interactive-element"
        >
          {activeStoryGroup.stories.map((story, index) => (
            <div
              key={story._id}
              style={{
                height: "4px",
                background: "rgba(255, 255, 255, 0.3)",
                flexGrow: 1,
                borderRadius: "2px",
                overflow: "hidden",
                cursor: "pointer",
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (index !== activeStoryIndex) {
                  // Jump to the selected story
                  if (progressIntervalRef.current) {
                    window.clearInterval(progressIntervalRef.current);
                  }
                  // Reset progress
                  setProgress(0);
                  // Set the active story index
                  setActiveStoryIndex(index);
                }
              }}
            >
              <motion.div
                style={{
                  height: "100%",
                  background: "#fff",
                  width:
                    index < activeStoryIndex
                      ? "100%"
                      : index === activeStoryIndex
                      ? `${progress}%`
                      : "0%",
                }}
                initial={{ width: index < activeStoryIndex ? "100%" : "0%" }}
                animate={{
                  width:
                    index < activeStoryIndex
                      ? "100%"
                      : index === activeStoryIndex
                      ? `${progress}%`
                      : "0%",
                }}
                transition={{
                  duration: index === activeStoryIndex && !isPaused ? 0.1 : 0.5,
                  ease: "linear",
                }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div
          style={{
            position: "absolute",
            top: "24px",
            left: 0,
            right: 0,
            padding: "0 12px",
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
          className="story-interactive-element"
        >
          <motion.div
            style={{ display: "flex", alignItems: "center", cursor: "pointer" }}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            onClick={(e) => {
              e.stopPropagation();
              // Navigate to profile
              if (activeStoryGroup?.userId) {
                closeStories();
                navigate(`/profile/${activeStoryGroup.userId}`);
              }
            }}
            className="story-interactive-element"
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                overflow: "hidden",
                border: "2px solid white",
                marginRight: "10px",
                backgroundColor: "#333",
              }}
            >
              {activeStoryGroup.profilePicture ? (
                <img
                  src={activeStoryGroup.profilePicture}
                  alt={`${activeStoryGroup.username}'s profile`}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    background: "linear-gradient(to right, #3b82f6, #8b5cf6)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontWeight: "bold",
                  }}
                >
                  {activeStoryGroup.username.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <p
                style={{
                  color: "white",
                  margin: 0,
                  fontWeight: "bold",
                  fontSize: "14px",
                }}
              >
                {activeStoryGroup.username}
              </p>
              <p
                style={{
                  color: "rgba(255,255,255,0.7)",
                  margin: "2px 0 0 0",
                  fontSize: "12px",
                }}
              >
                {calculateTimeAgo(currentStory.createdAt)}
              </p>
            </div>
          </motion.div>

          <motion.div
            style={{ display: "flex", gap: "8px" }}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {/* Pause/play button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                togglePause();
              }}
              className="story-interactive-element"
              style={{
                background: "rgba(0,0,0,0.6)",
                border: "none",
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                cursor: "pointer",
                transition: "transform 0.2s",
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = "scale(0.9)";
                e.stopPropagation();
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.stopPropagation();
              }}
            >
              {isPaused ? <FaPlay size={12} /> : <FaPause size={12} />}
            </button>

            {/* Menu button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowOptions(!showOptions);
              }}
              className="story-interactive-element"
              style={{
                background: "rgba(0,0,0,0.6)",
                border: "none",
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                cursor: "pointer",
                transition: "transform 0.2s",
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = "scale(0.9)";
                e.stopPropagation();
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.stopPropagation();
              }}
            >
              <FaEllipsisH size={12} />
            </button>

            {/* Options dropdown */}
            <AnimatePresence>
              {showOptions && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  style={{
                    position: "absolute",
                    top: "46px",
                    right: 0,
                    backgroundColor: "rgba(0,0,0,0.8)",
                    backdropFilter: "blur(10px)",
                    borderRadius: "8px",
                    width: "150px",
                    overflow: "hidden",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                    zIndex: 20,
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {isOwnStory && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteStory();
                        setShowOptions(false);
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        width: "100%",
                        padding: "12px",
                        background: "transparent",
                        border: "none",
                        color: "#ff6b6b",
                        fontSize: "14px",
                        textAlign: "left",
                        cursor: "pointer",
                      }}
                    >
                      <FaTrash size={14} />
                      <span>Delete Story</span>
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Close button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClose();
              }}
              className="story-interactive-element"
              style={{
                background: "rgba(0,0,0,0.6)",
                border: "none",
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                cursor: "pointer",
                transition: "transform 0.2s",
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = "scale(0.9)";
                e.stopPropagation();
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.stopPropagation();
              }}
            >
              <FaTimes size={16} />
            </button>
          </motion.div>
        </div>

        {/* Story image with animation */}
        <motion.img
          src={currentStory.image}
          alt="Story"
          initial={{ scale: isEntering ? 1.1 : 1 }}
          animate={{
            scale: longPressActive ? 0.95 : 1,
            filter: longPressActive ? "brightness(0.8)" : "brightness(1)",
          }}
          transition={{ duration: 0.3 }}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
          onLoad={() => {
            console.log("Story image loaded successfully:", currentStory._id);
            // Force a repaint by triggering a small animation
            const img = document.querySelector(
              `img[data-story-id="${currentStory._id}"]`
            );
            if (img) {
              img.animate([{ opacity: 0.99 }, { opacity: 1 }], {
                duration: 10,
              });
            }
          }}
          onError={(e) => {
            console.error("Error loading story image:", e, currentStory.image);
          }}
          data-story-id={currentStory._id}
        />

        {/* Reaction animation */}
        <AnimatePresence>
          {reactionAnimating && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.2, opacity: 0 }}
              transition={{ duration: 0.5, type: "spring" }}
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                pointerEvents: "none",
                zIndex: 15,
              }}
            >
              <IoHeartSharp
                size={80}
                style={{
                  color: "#9333ea", // Purple heart
                  filter: "drop-shadow(0 0 10px rgba(147, 51, 234, 0.5))",
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* When paused overlay */}
        <AnimatePresence>
          {isPaused && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "rgba(0,0,0,0.3)",
                zIndex: 12,
              }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ type: "spring", damping: 20 }}
                style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(0,0,0,0.6)",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <FaPlay size={24} color="white" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Caption */}
        {currentStory.caption && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            style={{
              position: "absolute",
              bottom: "90px",
              left: 0,
              right: 0,
              padding: "12px 16px",
              background: "linear-gradient(transparent, rgba(0,0,0,0.7))",
              color: "white",
              zIndex: 11,
            }}
          >
            <p style={{ margin: 0, fontSize: "14px" }}>
              {currentStory.caption}
            </p>
          </motion.div>
        )}

        {/* Bottom action bar */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: "16px",
            background: "linear-gradient(transparent, rgba(0,0,0,0.8))",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            zIndex: 10,
          }}
          className="story-interactive-element"
        >
          {/* Message input for replies - placeholder */}
          <div
            style={{
              flex: 1,
              marginRight: "10px",
              background: "rgba(255,255,255,0.2)",
              border: "none",
              borderRadius: "20px",
              padding: "8px 12px",
              color: "white",
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            Send message...
          </div>

          <div style={{ display: "flex", gap: "16px" }}>
            {/* Like button with purple color when liked */}
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                handleLikeStory();
              }}
              whileTap={{ scale: 0.9 }}
              style={{
                background: "transparent",
                border: "none",
                color: isLiked ? "#9333EA" : "white", // Purple color when liked
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IoHeartSharp size={24} />
            </motion.button>

            {/* View icon for own stories - without count */}
            {isOwnStory && (
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleViewers();
                }}
                whileTap={{ scale: 0.9 }}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "white",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <IoEyeOutline size={24} />
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Viewers panel for own stories */}
        <AnimatePresence>
          {isOwnStory && showViewers && (
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{
                type: "spring",
                damping: 25,
                stiffness: 300,
              }}
              className="story-interactive-element"
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: "60%",
                backgroundColor: "rgba(0,0,0,0.95)",
                backdropFilter: "blur(10px)",
                borderTopLeftRadius: "16px",
                borderTopRightRadius: "16px",
                padding: "16px",
                zIndex: 20,
                overflowY: "auto",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "16px",
                }}
              >
                <h3
                  style={{
                    color: "white",
                    margin: 0,
                    fontSize: "16px",
                    fontWeight: "bold",
                  }}
                >
                  Viewers ({viewers.length})
                </h3>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleViewers();
                  }}
                  style={{
                    background: "rgba(255,255,255,0.2)",
                    border: "none",
                    width: "30px",
                    height: "30px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    cursor: "pointer",
                  }}
                >
                  <FaTimes size={14} />
                </motion.button>
              </div>

              {viewersLoading ? (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100px",
                    color: "white",
                  }}
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    style={{
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      border: "2px solid rgba(255,255,255,0.3)",
                      borderTopColor: "white",
                      marginRight: "10px",
                    }}
                  />
                  Loading viewers...
                </div>
              ) : viewers.length > 0 ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  {viewers.map((viewer, index) => (
                    <motion.div
                      key={viewer._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        padding: "8px",
                        margin: "4px 0",
                        borderRadius: "8px",
                        background: "rgba(255,255,255,0.05)",
                        transition: "background 0.2s",
                        cursor: "pointer",
                      }}
                      whileHover={{
                        background: "rgba(255,255,255,0.1)",
                      }}
                      onClick={() => navigateToViewerProfile(viewer._id)}
                    >
                      <div
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "50%",
                          overflow: "hidden",
                          marginRight: "12px",
                          backgroundColor: "#333",
                          border: "1px solid rgba(255,255,255,0.2)",
                          position: "relative", // For the like badge
                        }}
                      >
                        {viewer.profilePicture ? (
                          <img
                            src={viewer.profilePicture}
                            alt={`${viewer.username}'s profile`}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: "100%",
                              height: "100%",
                              background:
                                "linear-gradient(to right, #3b82f6, #8b5cf6)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "white",
                              fontWeight: "bold",
                            }}
                          >
                            {viewer.username.charAt(0).toUpperCase()}
                          </div>
                        )}

                        {/* Purple heart badge for users who liked the story */}
                        {viewer.hasLiked && (
                          <div
                            style={{
                              position: "absolute",
                              bottom: "-3px",
                              right: "-3px",
                              width: "16px",
                              height: "16px",
                              borderRadius: "50%",
                              backgroundColor: "#9333EA", // Purple background
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              border: "1px solid white",
                            }}
                          >
                            <IoHeartSharp size={8} color="white" />
                          </div>
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p
                          style={{
                            color: "white",
                            margin: 0,
                            fontSize: "14px",
                            fontWeight: "bold",
                          }}
                        >
                          {viewer.username}
                        </p>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            marginTop: "2px",
                          }}
                        >
                          {viewer.hasLiked ? (
                            <IoHeartSharp
                              size={10}
                              style={{
                                color: "#9333EA",
                                marginRight: "4px",
                              }}
                            />
                          ) : (
                            <IoEyeOutline
                              size={10}
                              style={{
                                color: "rgba(255,255,255,0.5)",
                                marginRight: "4px",
                              }}
                            />
                          )}
                        </div>
                      </div>
                      {/* Message button */}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        style={{
                          background: "rgba(59, 130, 246, 0.5)",
                          border: "none",
                          padding: "6px 12px",
                          borderRadius: "16px",
                          fontSize: "12px",
                          color: "white",
                          cursor: "pointer",
                          transition: "background 0.2s",
                        }}
                      >
                        Message
                      </motion.button>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "150px",
                    color: "rgba(255,255,255,0.6)",
                    textAlign: "center",
                  }}
                >
                  <IoEyeOutline
                    size={32}
                    style={{ opacity: 0.5, marginBottom: "16px" }}
                  />
                  <p>No one has viewed this story yet.</p>
                  <p style={{ fontSize: "12px", marginTop: "8px" }}>
                    When someone views your story, they will appear here.
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* CSS Animations */}
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            
            @keyframes heartBeat {
              0% { transform: scale(0.8); opacity: 0; }
              50% { transform: scale(1.2); opacity: 1; }
              100% { transform: scale(1); opacity: 0; }
            }
            
            @keyframes slideUp {
              from { transform: translateY(100%); }
              to { transform: translateY(0); }
            }

            @keyframes pulse {
              0% { opacity: 0.6; }
              50% { opacity: 1; }
              100% { opacity: 0.6; }
            }
          `}
        </style>
      </motion.div>
    </motion.div>
  );
};

export default StoryViewer;
