import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IUser } from "../../types/AuthTypes";
import axios from "axios";

interface UserTaggingModalProps {
  onClose: () => void;
  onSelectUser: (user: IUser) => void;
  position: { x: number; y: number };
}

const UserTaggingModal: React.FC<UserTaggingModalProps> = ({
  onClose,
  onSelectUser,
  position,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus search input when modal opens
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Search users when searchTerm changes
  useEffect(() => {
    const searchUsers = async () => {
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
          setSearchResults(response.data.users || []);
        } else {
          setError("Failed to search users");
        }
      } catch (err) {
        setError("An error occurred during search");
        console.error("User search error:", err);
      } finally {
        setLoading(false);
      }
    };

    // Debounce search requests
    const timeoutId = setTimeout(searchUsers, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Close modal when clicking outside
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

  // Calculate modal position to stay within viewport
  const calculateModalPosition = () => {
    // Adjust values to keep modal in viewport
    // These are percentage values
    let x = position.x;
    let y = position.y;

    // If position is too far right, show modal to the left
    if (x > 70) {
      x -= 30; // Move 30% left
    } else {
      x += 5; // Add small offset
    }

    // If position is too far down, show modal above
    if (y > 70) {
      y -= 30; // Move 30% up
    } else {
      y += 5; // Add small offset
    }

    return { x, y };
  };

  const modalPosition = calculateModalPosition();

  return (
    <div
      className="absolute z-10"
      style={{
        left: `${modalPosition.x}%`,
        top: `${modalPosition.y}%`,
      }}
    >
      <motion.div
        ref={modalRef}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-lg shadow-xl border border-gray-200 w-64"
      >
        <div className="p-3 border-b border-gray-200  text-gray-600">
          <input
            ref={inputRef}
            type="text"
            placeholder="Search for people..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-1 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>

        <div className="max-h-60 overflow-y-auto p-2  text-gray-600">
          {loading ? (
            <div className="flex justify-center py-4">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <div className="text-center py-4 text-red-500 text-sm">{error}</div>
          ) : searchResults.length > 0 ? (
            <ul className="divide-y divide-gray-100">
              {searchResults.map((user) => (
                <li
                  key={user._id}
                  className="py-2 px-2 hover:bg-blue-50 rounded-md cursor-pointer flex items-center"
                  onClick={() => onSelectUser(user)}
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 mr-2">
                    {user.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt={user.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-bold">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{user.username}</p>
                    {user.firstname && user.lastname && (
                      <p className="text-xs text-gray-500">
                        {user.firstname} {user.lastname}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : searchTerm ? (
            <div className="text-center py-4 text-gray-500 text-sm">
              No users found
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500 text-sm">
              Search for users to tag
            </div>
          )}
        </div>

        <div className="p-2 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-3 py-1 text-sm text-gray-700 hover:text-gray-900"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default UserTaggingModal;
