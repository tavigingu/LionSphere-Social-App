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
  const [direction, setDirection] = useState(0); // -1 pentru stânga, 1 pentru dreapta
  const containerRef = useRef<HTMLDivElement>(null);

  // Numărul de utilizatori afișați pe pagină
  const usersPerPage = 3;

  // Calculează numărul total de pagini
  const totalPages = Math.ceil(suggestedUsers.length / usersPerPage);

  // Utilizatorii afișați în pagina curentă
  const currentUsers = suggestedUsers.slice(
    currentPage * usersPerPage,
    (currentPage + 1) * usersPerPage
  );

  // Funcții pentru navigare
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

        // Inițializăm stările pentru butoanele de follow
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

      // Actualizăm starea de follow
      setFollowingStatus((prev) => ({ ...prev, [userId]: true }));

      // Eliminăm utilizatorul din sugestii după un scurt delay pentru feedback vizual
      setTimeout(() => {
        setSuggestedUsers((prev) => {
          const newSuggestions = prev.filter((user) => user._id !== userId);
          const newTotalPages = Math.ceil(newSuggestions.length / usersPerPage);

          // Ajustăm pagina curentă dacă nu mai sunt suficienți utilizatori
          if (currentPage >= newTotalPages && newTotalPages > 0) {
            setCurrentPage(newTotalPages - 1);
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

  if (loading) {
    return (
      <div className="w-full bg-white rounded-xl shadow-xl overflow-hidden p-4 mb-6 duration-300 hover:shadow-2xl">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Suggested for you
        </h3>
        <div className="flex justify-center py-4">
          <div className="animate-spin h-6 w-6 border-2 border-blue-500 rounded-full border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-white rounded-xl shadow-xl overflow-hidden p-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Suggested for you
        </h3>
        <p className="text-red-500 text-center">{error}</p>
      </div>
    );
  }

  if (suggestedUsers.length === 0) {
    return null; // Nu afișăm componenta dacă nu există sugestii
  }

  return (
    <div className="w-full bg-white rounded-xl shadow-xl overflow-hidden mb-6 duration-300 hover:shadow-2xl">
      <div className="p-4 pb-2">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Suggested for you
          </h3>

          {/* Butoane de navigare - vizibile doar dacă avem mai multe pagini */}
          {totalPages > 1 && (
            <div className="flex space-x-2">
              <motion.button
                onClick={goToPrevPage}
                disabled={currentPage === 0}
                whileHover={{ scale: currentPage === 0 ? 1 : 1.1 }}
                whileTap={{ scale: currentPage === 0 ? 1 : 0.9 }}
                className={`w-8 h-8 flex items-center justify-center rounded-full transition-all duration-300 ${
                  currentPage === 0
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-blue-500 text-white hover:bg-blue-600 hover:shadow-md"
                }`}
              >
                <FaChevronLeft size={14} />
              </motion.button>
              <motion.button
                onClick={goToNextPage}
                disabled={currentPage >= totalPages - 1}
                whileHover={{ scale: currentPage >= totalPages - 1 ? 1 : 1.1 }}
                whileTap={{ scale: currentPage >= totalPages - 1 ? 1 : 0.9 }}
                className={`w-8 h-8 flex items-center justify-center rounded-full transition-all duration-300 ${
                  currentPage >= totalPages - 1
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-blue-500 text-white hover:bg-blue-600 hover:shadow-md"
                }`}
              >
                <FaChevronRight size={14} />
              </motion.button>
            </div>
          )}
        </div>

        <div className="relative h-[190px] overflow-hidden" ref={containerRef}>
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.div
              key={currentPage}
              custom={direction}
              initial={{
                opacity: 0,
                x: direction * 300,
              }}
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
              className="absolute w-full space-y-2"
            >
              {currentUsers.map((suggestedUser) => (
                <div
                  key={suggestedUser._id}
                  className="flex items-center p-1.5 rounded-lg hover:bg-gray-50 transition-all duration-300 hover:shadow-md"
                >
                  {/* Avatar - stânga */}
                  <div
                    className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center cursor-pointer mr-3 transition-transform duration-300 hover:scale-105"
                    onClick={() => navigateToProfile(suggestedUser._id)}
                  >
                    {suggestedUser.profilePicture ? (
                      <img
                        src={suggestedUser.profilePicture}
                        alt={`Profilul lui ${suggestedUser.username}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white text-xl font-bold">
                        {suggestedUser.username.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* Informații utilizator - mijloc */}
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => navigateToProfile(suggestedUser._id)}
                  >
                    <p className="font-medium text-gray-800">
                      {suggestedUser.username}
                    </p>
                    <p className="text-xs text-gray-500">
                      {suggestedUser.firstname} {suggestedUser.lastname}
                    </p>
                  </div>

                  {/* Buton urmărire - dreapta */}
                  <button
                    onClick={() => handleFollow(suggestedUser._id)}
                    disabled={
                      followingStatus[suggestedUser._id] ||
                      followLoading[suggestedUser._id]
                    }
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-300 ${
                      followingStatus[suggestedUser._id]
                        ? "bg-purple-500 text-white"
                        : "bg-blue-500 hover:bg-blue-600 text-white hover:shadow-md"
                    }`}
                  >
                    {followLoading[suggestedUser._id] ? (
                      <span className="flex items-center justify-center">
                        <div className="w-3 h-3 border-t-2 border-b-2 border-white rounded-full animate-spin mr-1"></div>
                        ...
                      </span>
                    ) : followingStatus[suggestedUser._id] ? (
                      "Following"
                    ) : (
                      "Follow"
                    )}
                  </button>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Indicator de pagină cu animație - mutat în afara containerului de scroll */}
        {totalPages > 1 && (
          <div className="mt-2 flex justify-center">
            <div className="flex space-x-2">
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
                  className={`w-2 h-2 rounded-full cursor-pointer`}
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
    </div>
  );
};

export default PeopleYouMayKnow;
