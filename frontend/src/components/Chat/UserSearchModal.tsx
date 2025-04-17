import React, { useState, useEffect, useRef } from "react";
import { IUser } from "../../types/AuthTypes";
import { motion, AnimatePresence } from "framer-motion";
import useChatStore from "../../store/ChatStore";
import axios from "axios";

interface UserSearchModalProps {
  onClose: () => void;
  currentUser: IUser;
}

const UserSearchModal: React.FC<UserSearchModalProps> = ({
  onClose,
  currentUser,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { startChat } = useChatStore();

  // Focus search input when modal opens
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Handle clicks outside the modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `http://localhost:5001/user/search?username=${searchTerm}`
      );

      if (response.data.success) {
        // Filter out current user from results
        const filteredResults = response.data.users.filter(
          (user: IUser) => user._id !== currentUser._id
        );
        setSearchResults(filteredResults);
      } else {
        setError("Search failed");
      }
    } catch (error) {
      setError("An error occurred while searching");
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleStartChat = async (otherUser: IUser) => {
    try {
      await startChat(currentUser._id, otherUser._id);
      onClose();
    } catch (error) {
      setError("Failed to start chat");
      console.error("Start chat error:", error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
      <motion.div
        ref={modalRef}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-xl shadow-xl w-full max-w-md p-3 sm:p-4 max-h-[80vh] flex flex-col border border-purple-100/30"
      >
        <div className="flex justify-between items-center mb-3 sm:mb-4 pb-2 border-b border-purple-100/30">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800">
            New Conversation
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-purple-50 transition-colors text-gray-600"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 sm:h-6 sm:w-6"
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

        <div className="relative mb-3 sm:mb-4">
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search for users..."
            className="w-full px-3 sm:px-4 py-2 pr-10 border border-purple-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 shadow-sm text-sm sm:text-base"
          />
          <button
            onClick={handleSearch}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-purple-600 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 sm:h-5 sm:w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-3 sm:mb-4 p-2 bg-red-50 text-red-700 rounded-md border border-red-200 text-xs sm:text-sm">
            {error}
          </div>
        )}

        <div className="flex-grow overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-6 sm:py-8">
              <div className="animate-spin h-6 w-6 sm:h-8 sm:w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
            </div>
          ) : searchResults.length > 0 ? (
            <ul className="divide-y divide-purple-100/30">
              {searchResults.map((user) => (
                <li
                  key={user._id}
                  className="py-2 sm:py-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 cursor-pointer transition-colors rounded-md"
                  onClick={() => handleStartChat(user)}
                >
                  <div className="flex items-center px-2">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden mr-2 sm:mr-3 border border-purple-100 shadow-sm">
                      {user.profilePicture ? (
                        <img
                          src={user.profilePicture}
                          alt={user.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800 text-sm sm:text-base">
                        {user.username}
                      </h3>
                      {user.firstname && user.lastname && (
                        <p className="text-xs sm:text-sm text-gray-500">
                          {user.firstname} {user.lastname}
                        </p>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : searchTerm ? (
            <div className="text-center py-6 sm:py-8 text-gray-500">
              <div className="p-4 sm:p-6 rounded-lg bg-gray-50 inline-block">
                <p className="text-sm sm:text-base">
                  No users found matching '{searchTerm}'
                </p>
                <p className="text-xs sm:text-sm mt-2 text-gray-400">
                  Try a different search term
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 sm:py-8 text-gray-500">
              <div className="p-4 sm:p-6 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 inline-block">
                <p className="text-sm sm:text-base">
                  Search for users to start a conversation
                </p>
                <p className="text-xs sm:text-sm mt-2 text-gray-400">
                  You can search by username
                </p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default UserSearchModal;
