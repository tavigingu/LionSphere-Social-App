import React from "react";
import { IMessage } from "../../types/ChatTypes";
import { IChatUser } from "../../types/ChatTypes";
import { motion } from "framer-motion";
import { format } from "date-fns";

interface MessageItemProps {
  message: IMessage;
  isCurrentUser: boolean;
  showSenderInfo: boolean;
  otherUser: IChatUser;
}

const MessageItem: React.FC<MessageItemProps> = ({
  message,
  isCurrentUser,
  showSenderInfo,
  otherUser,
}) => {
  const formattedTime = format(new Date(message.createdAt), "h:mm a");

  // Determine delivery status
  let statusText = "";
  let statusColor = "text-gray-400";

  if (message.sending) {
    statusText = "Sending...";
    statusColor = "text-gray-400";
  } else if (message.failed) {
    statusText = "Failed";
    statusColor = "text-red-500";
  } else if (isCurrentUser) {
    if (message.readBy.length > 1) {
      statusText = "Read";
      statusColor = "text-green-500";
    } else {
      statusText = "Delivered";
      statusColor = "text-gray-400";
    }
  }

  // Animation variants
  const messageVariants = {
    initial: {
      opacity: 0,
      x: isCurrentUser ? 20 : -20,
    },
    animate: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
      },
    },
  };

  return (
    <motion.div
      variants={messageVariants}
      initial="initial"
      animate="animate"
      className={`flex flex-col ${isCurrentUser ? "items-end" : "items-start"}`}
    >
      {/* Show sender info (avatar and time) if needed */}
      {showSenderInfo && !isCurrentUser && (
        <div className="flex items-center mb-1">
          <div className="w-6 h-6 rounded-full overflow-hidden mr-1">
            {otherUser.profilePicture ? (
              <img
                src={otherUser.profilePicture}
                alt={otherUser.username}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold text-xs">
                {otherUser.username.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <span className="text-xs text-gray-500">{formattedTime}</span>
        </div>
      )}

      {/* Show time only for current user */}
      {showSenderInfo && isCurrentUser && (
        <div className="flex items-center mb-1 space-x-1">
          <span className="text-xs text-gray-500">{formattedTime}</span>
          <span className={`text-xs ${statusColor}`}>{statusText}</span>
        </div>
      )}

      {/* Message bubble */}
      <div
        className={`px-4 py-2 rounded-2xl max-w-xs sm:max-w-sm break-words ${
          isCurrentUser
            ? "bg-blue-600 text-white rounded-tr-none"
            : "bg-gray-200 text-gray-800 rounded-tl-none"
        } ${message.failed ? "opacity-75" : ""}`}
      >
        {/* If message was deleted */}
        {message.text === "This message was deleted" ? (
          <p className="italic text-sm opacity-75">{message.text}</p>
        ) : (
          <p>{message.text}</p>
        )}
      </div>

      {/* Image if present */}
      {message.image && (
        <div
          className={`mt-1 rounded-lg overflow-hidden ${
            isCurrentUser ? "rounded-tr-none" : "rounded-tl-none"
          }`}
        >
          <img
            src={message.image}
            alt="Message attachment"
            className="max-w-xs sm:max-w-sm max-h-60 object-contain"
          />
        </div>
      )}

      {/* Failed message retry button */}
      {message.failed && (
        <div className="mt-1 flex items-center">
          <button className="text-xs text-red-500 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3 w-3 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                clipRule="evenodd"
              />
            </svg>
            Retry
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default MessageItem;
