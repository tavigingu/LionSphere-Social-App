import React from "react";
import { motion } from "framer-motion";

const WelcomeChat = () => {
  return (
    <div className="h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 px-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center p-4 sm:p-8 max-w-lg mx-auto rounded-2xl bg-gradient-to-r from-white/70 to-purple-50/70 backdrop-blur-sm shadow-lg border border-purple-100/50"
      >
        <div className="bg-gradient-to-br from-blue-400/10 to-purple-400/10 p-4 sm:p-6 rounded-xl mb-4 sm:mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-3 sm:mb-4 text-purple-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 sm:mb-3">
            Welcome to Your Messages
          </h2>
          <p className="text-gray-600 mb-2 text-sm sm:text-base">
            Connect with friends through instant messaging
          </p>
          <p className="text-gray-500 text-xs sm:text-sm">
            Select a conversation from the sidebar or start a new one
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4">
          <button className="px-4 py-2 sm:px-5 sm:py-3 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 rounded-lg hover:from-blue-200 hover:to-blue-300 transition-all shadow-sm border border-blue-200/50 text-sm sm:text-base">
            View Recent Conversations
          </button>

          <button className="px-4 py-2 sm:px-5 sm:py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-md text-sm sm:text-base">
            Start a New Conversation
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default WelcomeChat;
