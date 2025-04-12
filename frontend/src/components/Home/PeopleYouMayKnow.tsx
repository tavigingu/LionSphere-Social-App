import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../store/AuthStore";
import { IUser } from "../../types/AuthTypes";
import { getSuggestedUsers, followUser } from "../../api/User";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const PeopleYouMayKnow: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [suggestedUsers, setSuggestedUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [followingStatus, setFollowingStatus] = useState<
    Record<string, boolean>
  >({});
  const [followLoading, setFollowLoading] = useState<Record<string, boolean>>(
    {}
  );
  const [currentPage, setCurrentPage] = useState(0);
  const [direction, setDirection] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const usersPerPage = 3;
  const totalPages = Math.ceil(suggestedUsers.length / usersPerPage);
  const currentUsers = suggestedUsers.slice(
    currentPage * usersPerPage,
    (currentPage + 1) * usersPerPage
  );

  const goToNextPage = () => {
    if (currentPage < totalPages - 1) {
      setDirection(1);
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 0) {
      setDirection(-1);
      setCurrentPage(currentPage - 1);
    }
  };

  useEffect(() => {
    const fetchSuggestedUsers = async () => {
      if (!user) return;

      setLoading(true);
      setError(null);

      try {
        const suggestions = await getSuggestedUsers(user._id);
        setSuggestedUsers(suggestions);

        const initialStatus: Record<string, boolean> = {};
        const initialLoading: Record<string, boolean> = {};
        suggestions.forEach((user) => {
          initialStatus[user._id] = false;
          initialLoading[user._id] = false;
        });
        setFollowingStatus(initialStatus);
        setFollowLoading(initialLoading);
      } catch (err) {
        console.error("Error fetching suggested users:", err);
        setError("Nu s-au putut încărca sugestiile");
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestedUsers();
  }, [user]);

  const handleFollow = async (userId: string) => {
    if (!user) return;

    setFollowLoading((prev) => ({ ...prev, [userId]: true }));

    try {
      await followUser(userId, user._id);
      useAuthStore.getState().updateUserProfile({
        following: [...user.following, userId],
      });
      setFollowingStatus((prev) => ({ ...prev, [userId]: true }));

      setTimeout(() => {
        setSuggestedUsers((prev) => {
          const newSuggestions = prev.filter((u) => u._id !== userId);
          const newTotalPages = Math.ceil(newSuggestions.length / usersPerPage);
          if (currentPage >= newTotalPages && newTotalPages > 0) {
            setCurrentPage(newTotalPages - 1);
          } else if (newSuggestions.length === 0) {
            setCurrentPage(0);
          }
          return newSuggestions;
        });
      }, 1000);
    } catch (err) {
      console.error("Nu s-a putut urmări utilizatorul:", err);
    } finally {
      setFollowLoading((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const navigateToProfile = (userId: string) => {
    navigate(`/profile/${userId}`);
  };

  const buttonVariants = {
    initial: { backgroundColor: "#3B82F6" },
    following: { backgroundColor: "#8B5CF6", transition: { duration: 0.5 } },
  };

  const userVariants = {
    initial: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.3 } },
  };

  if (loading) {
    return (
      <div className="w-full bg-white rounded-lg shadow-md overflow-hidden p-3 mb-6 duration-300 hover:shadow-lg">
        <h3 className="text-base font-semibold text-gray-800 mb-3">
          Suggested for you
        </h3>
        <div className="flex justify-center py-3">
          <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-white rounded-lg shadow-md overflow-hidden p-3 mb-6">
        <h3 className="text-base font-semibold text-gray-800 mb-3">
          Suggested for you
        </h3>
        <p className="text-red-500 text-center text-xs">{error}</p>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {suggestedUsers.length > 0 || loading || error ? (
        <motion.div
          key="people-you-may-know"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="w-full bg-white rounded-lg shadow-md overflow-hidden mb-6 duration-300 hover:shadow-lg"
        >
          <div className="p-3 pb-2">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-base font-semibold text-gray-800">
                Suggested for you
              </h3>
              {totalPages > 1 && (
                <div className="flex space-x-2">
                  <motion.button
                    onClick={goToPrevPage}
                    disabled={currentPage === 0}
                    whileHover={{ scale: currentPage === 0 ? 1 : 1.1 }}
                    whileTap={{ scale: currentPage === 0 ? 1 : 0.9 }}
                    className={`w-7 h-7 flex items-center justify-center rounded-full transition-all duration-300 ${
                      currentPage === 0
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-blue-500 text-white hover:bg-blue-600 hover:shadow-md"
                    }`}
                  >
                    <FaChevronLeft size={12} />
                  </motion.button>
                  <motion.button
                    onClick={goToNextPage}
                    disabled={currentPage >= totalPages - 1}
                    whileHover={{
                      scale: currentPage >= totalPages - 1 ? 1 : 1.1,
                    }}
                    whileTap={{
                      scale: currentPage >= totalPages - 1 ? 1 : 0.9,
                    }}
                    className={`w-7 h-7 flex items-center justify-center rounded-full transition-all duration-300 ${
                      currentPage >= totalPages - 1
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-blue-500 text-white hover:bg-blue-600 hover:shadow-md"
                    }`}
                  >
                    <FaChevronRight size={12} />
                  </motion.button>
                </div>
              )}
            </div>

            <div
              className="relative h-[170px] overflow-hidden"
              ref={containerRef}
            >
              <AnimatePresence initial={false} custom={direction}>
                <motion.div
                  key={currentPage}
                  custom={direction}
                  initial={{ opacity: 0, x: direction * 300 }}
                  animate={{
                    opacity: 1,
                    x: 0,
                    transition: {
                      x: { type: "spring", stiffness: 300, damping: 30 },
                      opacity: { duration: 0.2 },
                    },
                  }}
                  exit={{
                    opacity: 0,
                    x: direction * -300,
                    transition: {
                      x: { type: "spring", stiffness: 300, damping: 30 },
                      opacity: { duration: 0.2 },
                    },
                  }}
                  className="absolute w-full space-y-1.5"
                >
                  <AnimatePresence>
                    {currentUsers.map((suggestedUser) => (
                      <motion.div
                        key={suggestedUser._id}
                        variants={userVariants}
                        initial="initial"
                        animate="initial"
                        exit="exit"
                        className="flex items-center p-1 rounded-lg hover:bg-gray-50 transition-all duration-300 hover:shadow-md"
                      >
                        <div
                          className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center cursor-pointer mr-2 transition-transform duration-300 hover:scale-105"
                          onClick={() => navigateToProfile(suggestedUser._id)}
                        >
                          {suggestedUser.profilePicture ? (
                            <img
                              src={suggestedUser.profilePicture}
                              alt={`Profilul lui ${suggestedUser.username}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-white text-base font-bold">
                              {suggestedUser.username.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>

                        <div
                          className="flex-1 cursor-pointer"
                          onClick={() => navigateToProfile(suggestedUser._id)}
                        >
                          <p className="text-sm font-medium text-gray-800">
                            {suggestedUser.username}
                          </p>
                          <p className="text-[11px] text-gray-500">
                            {suggestedUser.firstname} {suggestedUser.lastname}
                          </p>
                        </div>

                        <motion.button
                          onClick={() => handleFollow(suggestedUser._id)}
                          disabled={
                            followingStatus[suggestedUser._id] ||
                            followLoading[suggestedUser._id]
                          }
                          variants={buttonVariants}
                          initial="initial"
                          animate={
                            followingStatus[suggestedUser._id]
                              ? "following"
                              : "initial"
                          }
                          className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
                        >
                          {followLoading[suggestedUser._id] ? (
                            <span className="flex items-center justify-center">
                              <div className="w-2.5 h-2.5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-1"></div>
                              ...
                            </span>
                          ) : followingStatus[suggestedUser._id] ? (
                            "Following"
                          ) : (
                            "Follow"
                          )}
                        </motion.button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              </AnimatePresence>
            </div>

            {totalPages > 1 && (
              <div className="mt-1.5 flex justify-center">
                <div className="flex space-x-1.5">
                  {Array.from({ length: totalPages }).map((_, index) => (
                    <motion.div
                      key={index}
                      initial={{ scale: 0.8 }}
                      animate={{
                        scale: index === currentPage ? 1 : 0.8,
                        backgroundColor:
                          index === currentPage ? "#3B82F6" : "#D1D5DB",
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                        duration: 0.3,
                      }}
                      className="w-1.5 h-1.5 rounded-full cursor-pointer"
                      onClick={() => {
                        setDirection(index > currentPage ? 1 : -1);
                        setCurrentPage(index);
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="empty"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="w-full bg-white rounded-lg shadow-md overflow-hidden mb-6 duration-300 hover:shadow-lg p-3"
        >
          <h3 className="text-base font-semibold text-gray-800 mb-3">
            Suggested for you
          </h3>
          <p className="text-gray-500 text-center text-xs">
            No suggestions available
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PeopleYouMayKnow;
