import React, { useState } from "react";
import { IChat } from "../../types/ChatTypes";
import { IUser } from "../../types/AuthTypes";
import useChatStore from "../../store/ChatStore";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface ChatHeaderProps {
  chat: IChat;
  currentUser: IUser;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ chat, currentUser }) => {
  const navigate = useNavigate();
  const { removeChat } = useChatStore();
  const [showOptions, setShowOptions] = useState(false);

  // Get the other user in the conversation
  const otherUser = chat.participants[0];

  // Determine online status
  const isOnline = chat.online || false;

  const handleViewProfile = () => {
    navigate(`/profile/${otherUser._id}`);
    setShowOptions(false);
  };

  const handleDeleteChat = async () => {
    if (window.confirm("Are you sure you want to delete this conversation?")) {
      try {
        await removeChat(chat._id, currentUser._id);
      } catch (error) {
        console.error("Failed to delete chat:", error);
      }
    }
    setShowOptions(false);
  };

  return (
    <div className="p-3 border-b border-gray-200 bg-white flex items-center justify-between shadow-sm">
      {/* User info */}
      <div className="flex items-center">
        {/* Avatar with online indicator */}
        <div className="relative">
          <div className="w-10 h-10 rounded-full overflow-hidden">
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
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
          )}
        </div>

        {/* User details */}
        <div className="ml-3">
          <h3 className="font-medium text-gray-800">{otherUser.username}</h3>
          <p className="text-xs text-gray-500">
            {isOnline ? (
              <span className="text-green-500">Online</span>
            ) : (
              "Offline"
            )}
            {chat.typing && (
              <span className="ml-2 text-blue-500 animate-pulse">
                Typing...
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="relative">
        <button
          onClick={() => setShowOptions(!showOptions)}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-gray-600"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>

        {/* Dropdown menu */}
        {showOptions && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-10 py-1 border border-gray-200"
          >
            <button
              onClick={handleViewProfile}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-2 text-gray-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clipRule="evenodd"
                />
              </svg>
              View Profile
            </button>
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
              Delete Conversation
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ChatHeader;
