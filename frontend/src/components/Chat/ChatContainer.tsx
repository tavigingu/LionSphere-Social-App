import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../store/AuthStore";
import useChatStore from "../../store/ChatStore";
import useSocketStore from "../../store/SocketStore";
import ChatList from "./ChatList";
import ChatWindow from "./ChatWindow";
import NewChatButton from "./NewChatButton";
import OnlineIndicator from "./OnlineIndicator";
import UserSearchModal from "./UserSearchModal";
import { motion } from "framer-motion";

const ChatContainer: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { chats, activeChat, loading, error, fetchChats, setActiveChat } =
    useChatStore();

  const {
    initialize: initializeSocket,
    disconnect: disconnectSocket,
    connected: socketConnected,
    onlineUsers,
  } = useSocketStore();

  const [showUserSearch, setShowUserSearch] = useState(false);
  const [chatInitialized, setChatInitialized] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);

  // Initialize socket on component mount if user is logged in
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    // Fetch chats for the logged in user
    fetchChats(user._id).then(() => {
      setChatInitialized(true);
      // Asigurăm-ne că nu există nicio conversație selectată inițial
      setActiveChat(null);
    });

    // Initialize socket connection
    initializeSocket(user._id);

    // Cleanup on unmount
    return () => {
      disconnectSocket();
    };
  }, [
    user,
    fetchChats,
    initializeSocket,
    disconnectSocket,
    navigate,
    setActiveChat,
  ]);

  // Handle responsive sidebar - hide sidebar on small screens when chat is active
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setShowSidebar(!activeChat);
      } else {
        setShowSidebar(true);
      }
    };

    // Initial check
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, [activeChat]);

  const handleChatSelect = (chat: any) => {
    setActiveChat(chat);
    // Hide sidebar on mobile when a chat is selected
    if (window.innerWidth < 768) {
      setShowSidebar(false);
    }
  };

  const handleNewChat = () => {
    setShowUserSearch(true);
  };

  const handleCloseUserSearch = () => {
    setShowUserSearch(false);
  };

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  if (!user) return null;

  return (
    <div className="h-full overflow-hidden">
      {/* Connection Status Indicator */}
      <OnlineIndicator connected={socketConnected} />

      <div className="flex h-full overflow-hidden bg-white/10 backdrop-blur-md">
        {/* Sidebar with chat list */}
        <div
          className={`${
            showSidebar ? "flex" : "hidden"
          } md:flex flex-col w-full md:w-80 flex-shrink-0 bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-md border-r border-purple-200/30 absolute md:relative z-20 h-full`}
        >
          <div className="p-4 border-b border-purple-200/30 flex items-center justify-between bg-gradient-to-r from-blue-500/10 to-purple-500/10">
            <h1 className="text-xl font-bold text-gray-800">Messages</h1>
            <NewChatButton onClick={handleNewChat} />
          </div>

          {/* Chat list */}
          <div className="flex-grow overflow-y-auto">
            <ChatList
              chats={chats}
              loading={loading}
              onChatSelect={handleChatSelect}
              activeChat={activeChat}
              onlineUsers={onlineUsers}
            />
          </div>
        </div>

        {/* Main chat window */}
        <div className="flex-grow h-full flex flex-col bg-white/80 backdrop-blur-md overflow-hidden relative">
          {/* Mobile back button when chat is active */}
          {activeChat && !showSidebar && (
            <button
              onClick={toggleSidebar}
              className="md:hidden absolute top-4 left-3 z-30 p-1 bg-white rounded-full shadow-md"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-gray-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          )}

          {activeChat ? (
            <ChatWindow chat={activeChat} currentUser={user} />
          ) : (
            <div className="h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
              {loading ? (
                <div className="text-center p-6">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading conversations...</p>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-center p-4 sm:p-8 max-w-lg mx-auto rounded-2xl bg-gradient-to-r from-white/70 to-purple-50/70 backdrop-blur-sm shadow-lg border border-purple-100/50"
                >
                  <div className="bg-gradient-to-br from-blue-400/10 to-purple-400/10 p-4 sm:p-6 rounded-xl mb-6">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 text-purple-400"
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
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3">
                      Welcome to Your Messages
                    </h2>
                    <p className="text-gray-600 mb-2">
                      Connect with friends through instant messaging
                    </p>
                    <p className="text-gray-500 text-sm">
                      Select a conversation from the sidebar or start a new one
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                    <button
                      onClick={handleNewChat}
                      className="px-5 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-md"
                    >
                      Start a New Conversation
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* User search modal for starting new chats */}
      {showUserSearch && (
        <UserSearchModal onClose={handleCloseUserSearch} currentUser={user} />
      )}
    </div>
  );
};

export default ChatContainer;
