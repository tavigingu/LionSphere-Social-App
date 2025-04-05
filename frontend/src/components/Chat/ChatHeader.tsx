import React, { useState } from "react";
import { IChat } from "../../types/ChatTypes";
import { IUser } from "../../types/AuthTypes";
import useChatStore from "../../store/ChatStore";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

interface ChatHeaderProps {
  chat: IChat;
  currentUser: IUser;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ chat, currentUser }) => {
  const navigate = useNavigate();
  const { removeChat } = useChatStore();
  const [showOptions, setShowOptions] = useState(false);

  // Get the other user in the conversation (not the current user)
  const otherUser =
    chat.participants.find((p) => p._id !== currentUser._id) ||
    chat.participants[0];

  // Determine online status
  const isOnline = chat.online || false;

  const handleViewProfile = () => {
    navigate(`/profile/${otherUser._id}`);
    setShowOptions(false);
  };

  const handleDeleteChat = async () => {
    if (window.confirm("Ești sigur că vrei să ștergi această conversație?")) {
      try {
        await removeChat(chat._id, currentUser._id);
      } catch (error) {
        console.error("Eroare la ștergerea conversației:", error);
      }
    }
    setShowOptions(false);
  };

  return (
    <div className="p-4 border-b border-purple-100/30 bg-gradient-to-r from-white/80 to-white/60 backdrop-blur-sm flex items-center justify-between shadow-sm">
      {/* User info - Now clickable for profile */}
      <div
        className="flex items-center cursor-pointer group"
        onClick={handleViewProfile}
      >
        {/* Avatar with online indicator */}
        <div className="relative">
          <div className="w-12 h-12 rounded-full overflow-hidden border border-purple-100 shadow-md transition-all group-hover:shadow-lg group-hover:border-purple-300">
            {otherUser.profilePicture ? (
              <img
                src={otherUser.profilePicture}
                alt={otherUser.username}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold">
                {otherUser.username.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          {isOnline && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
          )}
        </div>

        {/* User details */}
        <div className="ml-3 transition-all group-hover:translate-x-1">
          <h3 className="font-medium text-gray-800 group-hover:text-purple-700 transition-colors">
            {otherUser.username}
          </h3>
          <p className="text-xs">
            {isOnline ? (
              <span className="text-green-600 font-medium">Online</span>
            ) : (
              <span className="text-gray-500">Offline</span>
            )}
            {chat.typing && (
              <span className="ml-2 text-blue-600 font-medium animate-pulse">
                Tastează...
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="relative">
        <button
          onClick={() => setShowOptions(!showOptions)}
          className="p-2 rounded-full hover:bg-purple-100/50 transition-colors text-gray-700"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>

        {/* Dropdown menu - Removed the View Profile option since it's on the user info now */}
        <AnimatePresence>
          {showOptions && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-10 py-1 border border-purple-100/50 overflow-hidden"
            >
              <button
                onClick={handleDeleteChat}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-2 text-red-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Șterge conversația
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ChatHeader;
