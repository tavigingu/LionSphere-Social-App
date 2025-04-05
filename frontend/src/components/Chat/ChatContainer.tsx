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

  // Initialize socket on component mount if user is logged in
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    // Fetch chats for the logged in user
    fetchChats(user._id).then(() => {
      setChatInitialized(true);
    });

    // Initialize socket connection
    initializeSocket(user._id);

    // Cleanup on unmount
    return () => {
      disconnectSocket();
    };
  }, [user, fetchChats, initializeSocket, disconnectSocket, navigate]);

  // Auto-select the first chat when chats are loaded and no chat is selected
  useEffect(() => {
    if (chatInitialized && chats.length > 0 && !activeChat) {
      // Sort chats by latest activity
      const sortedChats = [...chats].sort((a, b) => {
        const aTime = a.latestMessage?.createdAt || a.updatedAt;
        const bTime = b.latestMessage?.createdAt || b.updatedAt;
        return new Date(bTime).getTime() - new Date(aTime).getTime();
      });

      // Set the most recent chat as active
      setActiveChat(sortedChats[0]);
    }
  }, [chats, activeChat, setActiveChat, chatInitialized]);

  const handleChatSelect = (chat: any) => {
    setActiveChat(chat);
  };

  const handleNewChat = () => {
    setShowUserSearch(true);
  };

  const handleCloseUserSearch = () => {
    setShowUserSearch(false);
  };

  if (!user) return null;

  return (
    <div className="h-full overflow-hidden">
      {/* Connection Status Indicator */}
      <OnlineIndicator connected={socketConnected} />

      <div className="flex h-full overflow-hidden bg-white/10 backdrop-blur-md">
        {/* Sidebar with chat list */}
        <div className="w-80 flex-shrink-0 bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-md flex flex-col border-r border-purple-200/30">
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
        <div className="flex-grow h-full flex flex-col bg-white/80 backdrop-blur-md overflow-hidden">
          {activeChat ? (
            <ChatWindow chat={activeChat} currentUser={user} />
          ) : (
            <div className="h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
              {loading ? (
                <div className="text-center p-6">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading conversations...</p>
                </div>
              ) : chats.length === 0 ? (
                <div className="text-center p-8 max-w-lg rounded-2xl bg-white/60 backdrop-blur-sm shadow-lg border border-purple-100">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">
                    No conversations yet
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Start a new conversation to begin messaging with your
                    friends.
                  </p>
                  <button
                    onClick={handleNewChat}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-md"
                  >
                    Start a New Conversation
                  </button>
                </div>
              ) : (
                <div className="text-center p-6">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading your conversation...</p>
                </div>
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
