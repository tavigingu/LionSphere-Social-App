import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { SocketState } from '../types/ChatTypes';
import useChatStore from './ChatStore';

interface SocketStore extends SocketState {
  socket: Socket | null;
  initialize: (userId: string) => void;
  disconnect: () => void;
  sendMessage: (messageData: {
    recipientId: string;
    senderId: string;
    text: string;
    chatId: string;
  }) => void;
  sendTypingStatus: (chatId: string, userId: string, isTyping: boolean) => void;
}

const SOCKET_URL = 'http://localhost:5001';

const useSocketStore = create<SocketStore>((set, get) => ({
  socket: null,
  connected: false,
  onlineUsers: [],
  initialConnectionEstablished: false,
  
  initialize: (userId: string) => {
    // Create socket if it doesn't exist
    if (!get().socket) {
      const newSocket = io(SOCKET_URL, {
        withCredentials: true,
      });
      
      // Set up event listeners
      newSocket.on('connect', () => {
        console.log('Socket connected!');
        set({ connected: true });
        
        // Identify the user to the server
        newSocket.emit('user_connect', userId);
      });
      
      newSocket.on('disconnect', () => {
        console.log('Socket disconnected!');
        set({ connected: false });
      });
      
      // Listen for online users update
      newSocket.on('online_users', (onlineUserIds: string[]) => {
        console.log('Online users:', onlineUserIds);
        set({ 
          onlineUsers: onlineUserIds,
          initialConnectionEstablished: true 
        });
        
        // Update online status in all chats
        onlineUserIds.forEach(id => {
          useChatStore.getState().updateUserOnlineStatus(id, true);
        });
      });
      
      // Listen for user status changes
      newSocket.on('user_status', ({ userId: statusUserId, status }: { userId: string, status: string }) => {
        console.log(`User ${statusUserId} is now ${status}`);
        
        // Update online users list
        set(state => {
          let updatedOnlineUsers = [...state.onlineUsers];
          
          if (status === 'online' && !updatedOnlineUsers.includes(statusUserId)) {
            updatedOnlineUsers.push(statusUserId);
          } else if (status === 'offline') {
            updatedOnlineUsers = updatedOnlineUsers.filter(id => id !== statusUserId);
          }
          
          return { onlineUsers: updatedOnlineUsers };
        });
        
        // Update chat store
        useChatStore.getState().updateUserOnlineStatus(
          statusUserId, 
          status === 'online'
        );
      });
      
      // Listen for new messages
      newSocket.on('receive_message', (data) => {
        console.log('Received message:', data);
        
        const { chatId, senderId, text, createdAt } = data;
        
        // Add message to chat
        useChatStore.getState().addLocalMessage({
          _id: `received_${Date.now()}`, // Temporary ID until we refresh
          chatId,
          senderId,
          text,
          readBy: [],
          createdAt: createdAt || new Date().toISOString(),
          updatedAt: createdAt || new Date().toISOString()
        });
        
        // Update unread count
        const chats = useChatStore.getState().chats;
        const activeChat = useChatStore.getState().activeChat;
        
        // Only increment unread if this chat isn't currently active
        if (!activeChat || activeChat._id !== chatId) {
          const updatedChats = chats.map(chat => {
            if (chat._id === chatId) {
              return {
                ...chat,
                unreadCount: (chat.unreadCount || 0) + 1,
                latestMessage: {
                  _id: `temp_latest_${Date.now()}`,
                  chatId,
                  senderId,
                  text,
                  readBy: [],
                  createdAt: createdAt || new Date().toISOString(),
                  updatedAt: createdAt || new Date().toISOString()
                }
              };
            }
            return chat;
          });
          
          // Sort chats by latest message
          const sortedChats = [...updatedChats].sort((a, b) => {
            const aTime = a.latestMessage?.createdAt || a.updatedAt;
            const bTime = b.latestMessage?.createdAt || b.updatedAt;
            return new Date(bTime).getTime() - new Date(aTime).getTime();
          });
          
          useChatStore.setState({ chats: sortedChats });
        }
      });
      
      // Listen for typing indicators
      newSocket.on('user_typing', ({ chatId, userId }: { chatId: string, userId: string }) => {
        console.log(`User ${userId} is typing in chat ${chatId}`);
        useChatStore.getState().updateChatTypingStatus(chatId, userId, true);
      });
      
      // Listen for stop typing
      newSocket.on('user_stop_typing', ({ chatId, userId }: { chatId: string, userId: string }) => {
        console.log(`User ${userId} stopped typing in chat ${chatId}`);
        useChatStore.getState().updateChatTypingStatus(chatId, userId, false);
      });
      
      // Save socket to state
      set({ socket: newSocket });
    }
  },
  
  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, connected: false, initialConnectionEstablished: false });
    }
  },
  
  sendMessage: (messageData) => {
    const { socket } = get();
    if (socket && socket.connected) {
      socket.emit('send_message', messageData);
    } else {
      console.error('Socket not connected, cannot send message');
    }
  },
  
  sendTypingStatus: (chatId, userId, isTyping) => {
    const { socket } = get();
    if (socket && socket.connected) {
      if (isTyping) {
        socket.emit('typing', { chatId, userId });
      } else {
        socket.emit('stop_typing', { chatId, userId });
      }
    }
  }
}));

export default useSocketStore;