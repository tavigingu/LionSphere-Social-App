import React, { useEffect, useRef, useState } from "react";
import { IChat } from "../../types/ChatTypes";
import { IUser } from "../../types/AuthTypes";
import useChatStore from "../../store/ChatStore";
import useSocketStore from "../../store/SocketStore";
import MessageItem from "./MessageItem";
import MessageInput from "./MessageInput";
import ChatHeader from "./ChatHeader";
import { motion, AnimatePresence } from "framer-motion";

interface ChatWindowProps {
  chat: IChat;
  currentUser: IUser;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ chat, currentUser }) => {
  const {
    messages,
    messagesLoading,
    messagesPagination,
    fetchMessages,
    markChatRead,
    sendMessage,
  } = useChatStore();

  const { sendMessage: sendSocketMessage } = useSocketStore();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const [lastScrollTop, setLastScrollTop] = useState(0);
  const [showScrollButton, setShowScrollButton] = useState(false);

  // Fetch messages when chat changes
  useEffect(() => {
    if (chat && chat._id && currentUser) {
      fetchMessages(chat._id, currentUser._id);
    }
  }, [chat?._id, currentUser?._id, fetchMessages]);

  // Mark chat as read when opened
  useEffect(() => {
    if (chat && chat._id && currentUser && chat.unreadCount > 0) {
      markChatRead(chat._id, currentUser._id);
    }
  }, [chat?._id, currentUser?._id, chat?.unreadCount, markChatRead]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current && chat && messages[chat._id]) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, chat]);

  // Detect scroll position to show/hide scroll to bottom button
  useEffect(() => {
    const handleScroll = () => {
      const container = messageContainerRef.current;
      if (!container) return;

      const scrollTop = container.scrollTop;
      const scrollHeight = container.scrollHeight;
      const clientHeight = container.clientHeight;
      const scrollBottom = scrollHeight - scrollTop - clientHeight;

      // Show button when scrolled up
      setShowScrollButton(scrollBottom > 100);

      // Track last scroll position for infinite scrolling
      setLastScrollTop(scrollTop);
    };

    const container = messageContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, []);

  // Function to load more messages when scrolling to top
  const handleScrollTop = () => {
    if (!chat || !chat._id) return;

    const container = messageContainerRef.current;
    if (!container) return;

    // If scrolled to top and more messages are available, load more
    if (container.scrollTop === 0) {
      const pagination = messagesPagination[chat._id] || {
        page: 1,
        hasMore: false,
      };

      if (pagination.hasMore) {
        // Remember current height to maintain scroll position
        const oldHeight = container.scrollHeight;

        // Fetch next page of messages
        fetchMessages(chat._id, currentUser._id, pagination.page + 1).then(
          () => {
            // After loading, restore scroll position
            if (container) {
              const newHeight = container.scrollHeight;
              container.scrollTop = newHeight - oldHeight;
            }
          }
        );
      }
    }
  };

  // Handler for sending messages
  const handleSendMessage = async (text: string) => {
    if (!text.trim() || !chat || !chat._id) return;

    try {
      // Get the recipient (the other user in the conversation)
      const otherUser = chat.participants.find(
        (p) => p._id !== currentUser._id
      );

      if (!otherUser) {
        console.error("Recipient not found in chat participants");
        return;
      }

      // Send message via socket for real-time delivery
      sendSocketMessage({
        chatId: chat._id,
        senderId: currentUser._id,
        recipientId: otherUser._id,
        text,
      });

      // Send via API for persistence
      await sendMessage(chat._id, currentUser._id, text);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  // Get the message list for the current chat
  const chatMessages = chat && chat._id ? messages[chat._id] || [] : [];

  // Make sure we're not showing an empty window
  if (!chat || !chat.participants || chat.participants.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center p-6">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading conversation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full relative">
      {/* Chat Header - pass the other user, not the current user */}
      <ChatHeader chat={chat} currentUser={currentUser} />

      {/* Messages Container */}
      <div
        ref={messageContainerRef}
        className="flex-grow overflow-y-auto px-4 py-2 bg-gradient-to-b from-blue-50/70 to-purple-50/70"
        onScroll={handleScrollTop}
      >
        {messagesLoading && chatMessages.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
          </div>
        ) : (
          <>
            {/* Loading indicator for pagination */}
            {messagesLoading && (
              <div className="flex justify-center py-2">
                <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
              </div>
            )}

            {/* Messages list */}
            <div className="space-y-2 py-2">
              {chatMessages.map((message, index) => {
                const isCurrentUser = message.senderId === currentUser._id;
                const previousMessage =
                  index > 0 ? chatMessages[index - 1] : null;
                const showSenderInfo =
                  !previousMessage ||
                  previousMessage.senderId !== message.senderId ||
                  // Show timestamp if more than 5 minutes between messages
                  new Date(message.createdAt).getTime() -
                    new Date(previousMessage.createdAt).getTime() >
                    5 * 60 * 1000;

                // Get other user info for the message
                const otherUser = chat.participants.find(
                  (p) => p._id !== currentUser._id
                );

                return (
                  <MessageItem
                    key={message._id}
                    message={message}
                    isCurrentUser={isCurrentUser}
                    showSenderInfo={showSenderInfo}
                    otherUser={otherUser || chat.participants[0]}
                  />
                );
              })}

              {/* Empty div for scrolling to bottom */}
              <div ref={messagesEndRef} />
            </div>
          </>
        )}

        {/* Scroll to bottom button */}
        <AnimatePresence>
          {showScrollButton && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-20 right-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-2 rounded-full shadow-lg hover:shadow-xl transition-shadow"
              onClick={() =>
                messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
              }
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L10 6.414l-3.293 3.293a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Message input */}
      <MessageInput
        onSendMessage={handleSendMessage}
        chatId={chat._id}
        userId={currentUser._id}
      />
    </div>
  );
};

export default ChatWindow;
