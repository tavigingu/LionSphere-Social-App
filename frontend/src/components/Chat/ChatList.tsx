import React from "react";
import { formatDistanceToNow } from "date-fns";
import { IChat } from "../../types/ChatTypes";
import { motion } from "framer-motion";

interface ChatListProps {
  chats: IChat[];
  loading: boolean;
  onChatSelect: (chat: IChat) => void;
  activeChat: IChat | null;
  onlineUsers: string[];
}

const ChatList: React.FC<ChatListProps> = ({
  chats,
  loading,
  onChatSelect,
  activeChat,
  onlineUsers,
}) => {
  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse">
          {[...Array(5)].map((_, index) => (
            <div
              key={index}
              className="flex items-center py-3 border-b border-purple-100/30"
            >
              <div className="w-12 h-12 bg-purple-200/30 rounded-full mr-3"></div>
              <div className="flex-grow">
                <div className="h-4 bg-purple-200/30 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-purple-200/30 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="p-6 rounded-xl bg-white/30 backdrop-blur-sm shadow-sm border border-purple-100/30">
          <p className="text-gray-700 font-medium">No conversations yet</p>
          <p className="text-sm text-gray-500 mt-1">
            Start a new chat to begin messaging
          </p>
        </div>
      </div>
    );
  }

  const formatTime = (timestamp: string) => {
    try {
      // For messages less than a day old, show time
      const messageDate = new Date(timestamp);
      const now = new Date();

      // Same day - show time
      if (messageDate.toDateString() === now.toDateString()) {
        return messageDate.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
      }

      // Different day but less than a week - show day name
      if (now.getTime() - messageDate.getTime() < 7 * 24 * 60 * 60 * 1000) {
        return messageDate.toLocaleDateString([], { weekday: "short" });
      }

      // Older - show date
      return messageDate.toLocaleDateString([], {
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  return (
    <div className="divide-y divide-purple-100/30">
      {chats.map((chat) => {
        // Get the other participant in the chat (assuming 1-on-1 chats)
        const otherParticipant = chat.participants[0];

        // Check if user is online
        const isOnline = onlineUsers.includes(otherParticipant._id);

        // Check if chat is active
        const isActive = activeChat?._id === chat._id;

        // Get latest message text
        const latestMessage = chat.latestMessage?.text || "No messages yet";

        return (
          <motion.div
            key={chat._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ backgroundColor: "rgba(139, 92, 246, 0.05)" }}
            onClick={() => onChatSelect(chat)}
            className={`flex items-center p-3 cursor-pointer transition-all ${
              isActive
                ? "bg-gradient-to-r from-blue-100/50 to-purple-100/50 border-l-4 border-purple-500"
                : "hover:border-l-4 hover:border-purple-300 border-l-4 border-transparent"
            }`}
          >
            {/* Avatar with online indicator */}
            <div className="relative">
              <div className="w-12 h-12 rounded-full overflow-hidden border border-purple-100 shadow-md">
                {otherParticipant.profilePicture ? (
                  <img
                    src={otherParticipant.profilePicture}
                    alt={otherParticipant.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold">
                    {otherParticipant.username.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              {isOnline && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
              )}
            </div>

            {/* Chat info */}
            <div className="ml-3 flex-grow overflow-hidden">
              <div className="flex justify-between items-center">
                <h3
                  className={`font-semibold ${
                    isActive ? "text-purple-800" : "text-gray-800"
                  } truncate`}
                >
                  {otherParticipant.username}
                </h3>
                <span className="text-xs text-gray-500">
                  {chat.latestMessage
                    ? formatTime(chat.latestMessage.createdAt)
                    : formatTime(chat.updatedAt)}
                </span>
              </div>

              <div className="flex items-center">
                <p
                  className={`text-sm truncate mr-2 ${
                    chat.unreadCount > 0
                      ? "text-gray-800 font-medium"
                      : "text-gray-500"
                  }`}
                >
                  {chat.typing ? (
                    <span className="text-blue-600 italic animate-pulse">
                      Typing...
                    </span>
                  ) : (
                    latestMessage
                  )}
                </p>

                {/* Unread count badge */}
                {chat.unreadCount > 0 && (
                  <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
                    {chat.unreadCount > 9 ? "9+" : chat.unreadCount}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default ChatList;
