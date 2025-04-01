import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/AuthStore';
import useChatStore from '../../store/ChatStore';
import useSocketStore from '../../store/SocketStore';
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';
import NewChatButton from './NewChatButton';
import OnlineIndicator from './OnlineIndicator';
import UserSearchModal from './UserSearchModal';

const ChatContainer: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { 
    chats, 
    activeChat, 
    loading, 
    error,
    fetchChats, 
    setActiveChat 
  } = useChatStore();
  
  const { 
    initialize: initializeSocket, 
    disconnect: disconnectSocket,
    connected: socketConnected,
    onlineUsers
  } = useSocketStore();
  
  const [showUserSearch, setShowUserSearch] = useState(false);
  
  // Initialize socket on component mount if user is logged in
  useEffect(() => {
    if (!user) {
      navigate('/login');
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
    <div className="relative min-h-screen bg-gray-100 flex flex-col">
      {/* Connection Status Indicator */}
      <OnlineIndicator connected={socketConnected} />
      
      <div className="flex flex-col md:flex-row flex-grow">
        {/* Sidebar with chat list */}
        <div className="w-full md:w-80 bg-white shadow-md md:h-screen overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
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
        <div className="flex-grow md:h-screen overflow-hidden bg-gray-50">
          {activeChat ? (
            <ChatWindow chat={activeChat} currentUser={user} />
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center p-8 max-w-lg">
                <h2 className="text-2xl font-bold text-gray-700 mb-4">No chat selected</h2>
                <p className="text-gray-500 mb-6">
                  Select a conversation from the list or start a new one to begin chatting.
                </p>
                <button
                  onClick={handleNewChat}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
        <UserSearchModal 
          onClose={handleCloseUserSearch}
          currentUser={user}
        />
      )}
    </div>
  );
};

export default ChatContainer;