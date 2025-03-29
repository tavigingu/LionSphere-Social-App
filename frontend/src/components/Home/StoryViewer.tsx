// frontend/src/components/Home/StoryViewer.tsx
import React, { useEffect, useState, useRef } from "react";
import {
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaTrash,
  FaEye,
  FaShare,
  FaHeart,
  FaComment,
  FaClock,
  FaVolumeMute,
  FaVolumeUp,
  FaPause,
  FaPlay,
  FaEllipsisH,
} from "react-icons/fa";
import useStoryStore from "../../store/StoryStore";
import useAuthStore from "../../store/AuthStore";
import { formatDistanceToNow } from "date-fns";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

const StoryViewer: React.FC = () => {
  const {
    activeStoryGroup,
    activeStoryIndex,
    closeStories,
    nextStory,
    prevStory,
    viewStory,
    deleteStory,
    storyGroups,
    setActiveStoryIndex,
  } = useStoryStore();
  const { user } = useAuthStore();

  const [progress, setProgress] = useState(0);
  const progressIntervalRef = useRef<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showViewers, setShowViewers] = useState(false);
  const [viewers, setViewers] = useState<any[]>([]);
  const [viewersLoading, setViewersLoading] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [reactionAnimating, setReactionAnimating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [longPressActive, setLongPressActive] = useState(false);
  const longPressTimer = useRef<number | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [isEntering, setIsEntering] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [showOptions, setShowOptions] = useState(false);

  const currentStory = activeStoryGroup?.stories[activeStoryIndex];
  const isOwnStory = user?._id === activeStoryGroup?.userId;

  // Set entering state on initial render
  useEffect(() => {
    setIsEntering(true);
    setTimeout(() => setIsEntering(false), 300);
    return () => setIsEntering(false);
  }, []);

  // Effect to load viewers
  useEffect(() => {
    if (isOwnStory && currentStory && showViewers) {
      setViewersLoading(true);
      // In a real app, you'd fetch this from API
      const fetchViewers = async () => {
        try {
          // Simulate API call with the viewers we have
          const viewerProfiles = [];
          for (const viewerId of currentStory.viewers) {
            try {
              // Try to get user info for each viewer
              const userResponse = await axios.get(
                `http://localhost:5001/user/${viewerId}`
              );
              if (userResponse.data.success) {
                viewerProfiles.push({
                  _id: viewerId,
                  username: userResponse.data.user.username,
                  profilePicture: userResponse.data.user.profilePicture,
                  viewedAt: new Date(
                    Date.now() - Math.random() * 3600000
                  ).toISOString(), // Random time within the last hour
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
  }, [currentStory, showViewers, isOwnStory]);

  // Handle view tracking and story navigation
  useEffect(() => {
    if (!activeStoryGroup || !currentStory || !user) {
      return;
    }

    // Mark story as viewed
    viewStory(currentStory._id, user._id);

    // Reset progress
    setProgress(0);

    // Reset paused state when story changes
    setIsPaused(false);

    // Start progress animation
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    const startProgressTimer = () => {
      const duration = 5000; // 5 seconds per story
      const interval = 16; // Update frequently for smooth animation
      const step = (interval / duration) * 100;

      progressIntervalRef.current = window.setInterval(() => {
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
      }, interval) as unknown as number;
    };

    if (!isPaused) {
      startProgressTimer();
    }

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
    isPaused,
  ]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      } else if (e.key === "ArrowLeft") {
        prevStory();
      } else if (e.key === "ArrowRight") {
        nextStory();
      } else if (e.key === " ") {
        // Space bar
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
        clearInterval(progressIntervalRef.current);
      }
    }, 200) as unknown as number;
  };

  const handleLongPressEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
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
              clearInterval(progressIntervalRef.current);
            }
            nextStory();
            return 0;
          }
          return prev + step;
        });
      }, interval) as unknown as number;
    }
  };

  // Handle toggle pause
  const togglePause = () => {
    setIsPaused(!isPaused);

    if (!isPaused) {
      // Pause progress
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
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
              clearInterval(progressIntervalRef.current);
            }
            nextStory();
            return 0;
          }
          return prev + step;
        });
      }, interval) as unknown as number;
    }
  };

  // Handle screen clicks for navigation
  const handleScreenClick = (e: React.MouseEvent) => {
    const { clientX } = e;
    const { innerWidth } = window;
    const third = innerWidth / 3;

    // Prevent navigation when clicking on any interactive elements
    if ((e.target as HTMLElement).closest(".story-interactive-element")) {
      return;
    }

    if (clientX < third) {
      prevStory();
    } else if (clientX > third * 2) {
      nextStory();
    }
  };

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

  const handleToggleViewers = () => {
    setShowViewers(!showViewers);
  };

  const handleLikeStory = () => {
    setIsLiked(!isLiked);

    // Show heart animation
    setReactionAnimating(true);
    setTimeout(() => {
      setReactionAnimating(false);
    }, 1000);

    // In a real app, you'd send this to the API
    // axios.post(`/api/story/${currentStory._id}/like`);
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      closeStories();
    }, 300);
  };

  const calculateTimeAgo = (timestamp: string) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

  if (!activeStoryGroup || !currentStory) {
    return null;
  }

  // Calculate the total number of stories across all users
  const allStories = storyGroups.flatMap((group) => group.stories);
  const currentStoryGlobalIndex = allStories.findIndex(
    (story) => story._id === currentStory._id
  );
  const totalStories = allStories.length;

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
      {/* Story container */}
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
                    clearInterval(progressIntervalRef.current);
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
            style={{ display: "flex", alignItems: "center" }}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
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

            {/* Mute/unmute button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMuted(!isMuted);
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
              {isMuted ? <FaVolumeMute size={12} /> : <FaVolumeUp size={12} />}
            </button>

            {/* Options button */}
            <div
              className="story-interactive-element"
              style={{ position: "relative" }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowOptions(!showOptions);
                }}
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
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Would implement story reporting here
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
                        color: "white",
                        fontSize: "14px",
                        textAlign: "left",
                        cursor: "pointer",
                      }}
                    >
                      <FaEye style={{ transform: "rotate(20deg)" }} size={14} />
                      <span>Report Story</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

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

        {/* Story counter display */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          style={{
            position: "absolute",
            top: "70px",
            right: "12px",
            zIndex: 10,
            padding: "4px 10px",
            background: "rgba(0,0,0,0.6)",
            borderRadius: "12px",
            fontSize: "12px",
            color: "white",
          }}
          className="story-interactive-element"
        >
          {currentStoryGlobalIndex + 1} / {totalStories}
        </motion.div>

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
              <FaHeart
                size={80}
                color="white"
                style={{
                  filter: "drop-shadow(0 0 10px rgba(255,0,0,0.5))",
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
            {/* Like button */}
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                handleLikeStory();
              }}
              whileTap={{ scale: 0.9 }}
              style={{
                background: "transparent",
                border: "none",
                color: isLiked ? "#f87171" : "white",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FaHeart size={20} />
            </motion.button>

            {/* Share button - placeholder */}
            <motion.button
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
              <FaShare size={20} />
            </motion.button>

            {/* View count for own stories */}
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
                <FaEye size={20} />
                <span style={{ marginLeft: "5px", fontSize: "14px" }}>
                  {currentStory.viewers.length}
                </span>
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
                  Viewers ({currentStory.viewers.length})
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
                      }}
                      whileHover={{
                        background: "rgba(255,255,255,0.1)",
                      }}
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
                          <FaClock
                            size={10}
                            style={{
                              color: "rgba(255,255,255,0.5)",
                              marginRight: "4px",
                            }}
                          />
                          <p
                            style={{
                              color: "rgba(255,255,255,0.6)",
                              margin: 0,
                              fontSize: "12px",
                            }}
                          >
                            {calculateTimeAgo(viewer.viewedAt)}
                          </p>
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
                  <FaEye
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

        {/* Navigation buttons (hidden but functional through click areas) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            prevStory();
          }}
          style={{
            position: "absolute",
            left: "0",
            top: "0",
            bottom: "0",
            width: "30%", // Wide click area
            background: "transparent",
            border: "none",
            cursor: "w-resize",
            zIndex: 5,
          }}
          aria-label="Previous story"
        />

        <button
          onClick={(e) => {
            e.stopPropagation();
            nextStory();
          }}
          style={{
            position: "absolute",
            right: "0",
            top: "0",
            bottom: "0",
            width: "30%", // Wide click area
            background: "transparent",
            border: "none",
            cursor: "e-resize",
            zIndex: 5,
          }}
          aria-label="Next story"
        />
      </motion.div>

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
  );
};

export default StoryViewer;
