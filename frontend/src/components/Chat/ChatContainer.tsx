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

  // Initialize socket on component mount if user is logged in
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    // Fetch chats for the logged in user
    fetchChats(user._id);

    // Initialize socket connection
    initializeSocket(user._id);

    // Cleanup on unmount
    return () => {
      disconnectSocket();
    };
  }, [user, fetchChats, initializeSocket, disconnectSocket, navigate]);

  // Auto-select first chat if none is selected
  useEffect(() => {
    if (chats.length > 0 && !activeChat) {
      setActiveChat(chats[0]);
    }
  }, [chats, activeChat, setActiveChat]);

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
    <div className="relative max-w-6xl mx-auto h-[calc(100vh-120px)] mt-4 mb-4 rounded-xl overflow-hidden shadow-2xl border border-purple-200/20">
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
              <div className="text-center p-8 max-w-lg rounded-2xl bg-white/60 backdrop-blur-sm shadow-lg border border-purple-100">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  No chat selected
                </h2>
                <p className="text-gray-600 mb-6">
                  Select a conversation from the list or start a new one to
                  begin chatting.
                </p>
                <button
                  onClick={handleNewChat}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-md"
                >
                  Start a New Conversation
                </button>
              </div>
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
