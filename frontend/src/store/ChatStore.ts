import { create } from 'zustand';
import { 
  getUserChats,
  getOrCreateChat,
  markChatAsRead,
  deleteChat,
  getChatMessages,
  sendMessage,
  deleteMessage,
  markMessageAsRead
} from '../api/Chat';
import { ChatState, IChat, IMessage } from '../types/ChatTypes';

interface ChatStore extends ChatState {
  // Chat actions
  fetchChats: (userId: string) => Promise<void>;
  startChat: (userId: string, otherUserId: string) => Promise<IChat>;
  markChatRead: (chatId: string, userId: string) => Promise<void>;
  removeChat: (chatId: string, userId: string) => Promise<void>;
  setActiveChat: (chat: IChat | null) => void;
  
  // Message actions
  fetchMessages: (chatId: string, userId: string, page?: number, limit?: number) => Promise<void>;
  sendMessage: (chatId: string, senderId: string, text: string, image?: string, replyTo?: string) => Promise<IMessage | undefined>;
  removeMessage: (messageId: string, userId: string, chatId: string) => Promise<void>;
  markMessageRead: (messageId: string, userId: string, chatId: string) => Promise<void>;
  
  // Local state management
  addLocalMessage: (message: IMessage) => void;
  updateMessageStatus: (messageId: string, chatId: string, updates: Partial<IMessage>) => void;
  setTypingStatus: (chatId: string | null) => void;
  updateChatTypingStatus: (chatId: string, userId: string, isTyping: boolean) => void;
  updateUserOnlineStatus: (userId: string, isOnline: boolean) => void;
  
  // Error handling
  clearError: () => void;
}

const initialMessagesPageState = {
  page: 1,
  hasMore: false,
  totalMessages: 0
};

const initialState: ChatState = {
  chats: [],
  activeChat: null,
  messages: {},
  loading: false,
  messagesLoading: false,
  error: null,
  messagesPagination: {},
  typingIn: null
};

const useChatStore = create<ChatStore>((set, get) => ({
  ...initialState,
  
  // Chat actions
  fetchChats: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      const chats = await getUserChats(userId);
      set({ chats, loading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch chats';
      set({ error: errorMessage, loading: false });
    }
  },
  
  startChat: async (userId: string, otherUserId: string) => {
    set({ loading: true, error: null });
    try {
      const chat = await getOrCreateChat(userId, otherUserId);
      
      // Update chats list with the new/updated chat
      set((state) => {
        // Check if chat already exists in list
        const chatExists = state.chats.some(c => c._id === chat._id);
        
        if (chatExists) {
          // Update existing chat
          const updatedChats = state.chats.map(c => 
            c._id === chat._id ? chat : c
          );
          return { chats: updatedChats, activeChat: chat, loading: false };
        } else {
          // Add new chat
          return { 
            chats: [chat, ...state.chats], 
            activeChat: chat, 
            loading: false 
          };
        }
      });
      
      return chat;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to start chat';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },
  
  markChatRead: async (chatId: string, userId: string) => {
    try {
      await markChatAsRead(chatId, userId);
      
      // Update local state to reflect read status
      set((state) => {
        const updatedChats = state.chats.map(chat => 
          chat._id === chatId ? { ...chat, unreadCount: 0 } : chat
        );
        
        // Also update active chat if it's the same one
        const updatedActiveChat = state.activeChat && state.activeChat._id === chatId
          ? { ...state.activeChat, unreadCount: 0 }
          : state.activeChat;
        
        return { chats: updatedChats, activeChat: updatedActiveChat };
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to mark chat as read';
      set({ error: errorMessage });
    }
  },
  
  removeChat: async (chatId: string, userId: string) => {
    try {
      await deleteChat(chatId, userId);
      
      // Remove chat from local state
      set((state) => {
        const updatedChats = state.chats.filter(chat => chat._id !== chatId);
        
        // Clear active chat if it was the deleted one
        const updatedActiveChat = state.activeChat && state.activeChat._id === chatId
          ? null
          : state.activeChat;
        
        // Also clean up messages
        const { [chatId]: _, ...restMessages } = state.messages;
        const { [chatId]: __, ...restPagination } = state.messagesPagination;
        
        return { 
          chats: updatedChats, 
          activeChat: updatedActiveChat,
          messages: restMessages,
          messagesPagination: restPagination
        };
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete chat';
      set({ error: errorMessage });
    }
  },
  
  setActiveChat: (chat: IChat | null) => {
    set({ activeChat: chat });
  },
  
  // Message actions
  fetchMessages: async (chatId: string, userId: string, page = 1, limit = 20) => {
    set({ messagesLoading: true, error: null });
    try {
      const result = await getChatMessages(chatId, page, limit);
      
      set((state) => {
        // Initialize or update pagination info
        const paginationInfo = {
          page: result.page,
          hasMore: result.hasMore,
          totalMessages: result.totalMessages
        };
        
        // Determine how to merge messages based on page number
        let updatedMessages: IMessage[];
        
        if (page === 1) {
          // First page, replace existing messages
          updatedMessages = result.messages;
        } else {
          // Subsequent page, append to existing messages
          const existingMessages = state.messages[chatId] || [];
          updatedMessages = [...existingMessages, ...result.messages];
        }
        
        return {
          messages: { ...state.messages, [chatId]: updatedMessages },
          messagesPagination: { ...state.messagesPagination, [chatId]: paginationInfo },
          messagesLoading: false
        };
      });
      
      // Mark chat as read whenever messages are fetched
      if (page === 1) {
        await markChatAsRead(chatId, userId);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch messages';
      set({ error: errorMessage, messagesLoading: false });
    }
  },
  
  sendMessage: async (chatId: string, senderId: string, text: string, image, replyTo) => {
    // Create a temporary message for optimistic updates
    const tempId = `temp_${Date.now()}`;
    const tempMessage: IMessage = {
      _id: tempId,
      chatId,
      senderId,
      text,
      image,
      replyTo,
      readBy: [senderId],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sending: true
    };
    
    // Add temporary message to state
    get().addLocalMessage(tempMessage);
    
    try {
      // Send the actual message
      const messageData = { chatId, senderId, text, image, replyTo };
      const sentMessage = await sendMessage(messageData);
      
      // Replace temporary message with the real one
      set((state) => {
        const chatMessages = state.messages[chatId] || [];
        const updatedMessages = chatMessages.map(msg => 
          msg._id === tempId ? sentMessage : msg
        );
        
        // Update latest message in chat list
        const updatedChats = state.chats.map(chat => {
          if (chat._id === chatId) {
            return {
              ...chat,
              latestMessage: sentMessage
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
        
        return {
          messages: { ...state.messages, [chatId]: updatedMessages },
          chats: sortedChats
        };
      });
      
      return sentMessage;
    } catch (error) {
      // Mark temporary message as failed
      set((state) => {
        const chatMessages = state.messages[chatId] || [];
        const updatedMessages = chatMessages.map(msg => 
          msg._id === tempId ? { ...msg, sending: false, failed: true } : msg
        );
        
        return {
          messages: { ...state.messages, [chatId]: updatedMessages },
          error: error instanceof Error ? error.message : 'Failed to send message'
        };
      });
      
      return undefined;
    }
  },
  
  removeMessage: async (messageId: string, userId: string, chatId: string) => {
    try {
      await deleteMessage(messageId, userId);
      
      // Update message in local state
      set((state) => {
        const chatMessages = state.messages[chatId] || [];
        const updatedMessages = chatMessages.map(msg => 
          msg._id === messageId 
            ? { ...msg, text: "This message was deleted", image: undefined } 
            : msg
        );
        
        return {
          messages: { ...state.messages, [chatId]: updatedMessages }
        };
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete message';
      set({ error: errorMessage });
    }
  },
  
  markMessageRead: async (messageId: string, userId: string, chatId: string) => {
    try {
      const { unreadCount } = await markMessageAsRead(messageId, userId);
      
      // Update message in local state
      set((state) => {
        const chatMessages = state.messages[chatId] || [];
        const updatedMessages = chatMessages.map(msg => 
          msg._id === messageId 
            ? { ...msg, readBy: [...msg.readBy, userId] } 
            : msg
        );
        
        // Update unread count in chat
        const updatedChats = state.chats.map(chat => 
          chat._id === chatId ? { ...chat, unreadCount } : chat
        );
        
        // Also update active chat if it's the same one
        const updatedActiveChat = state.activeChat && state.activeChat._id === chatId
          ? { ...state.activeChat, unreadCount }
          : state.activeChat;
        
        return {
          messages: { ...state.messages, [chatId]: updatedMessages },
          chats: updatedChats,
          activeChat: updatedActiveChat
        };
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to mark message as read';
      set({ error: errorMessage });
    }
  },
  
  // Local state management
  addLocalMessage: (message: IMessage) => {
    set((state) => {
      const chatMessages = state.messages[message.chatId] || [];
      return {
        messages: {
          ...state.messages,
          [message.chatId]: [...chatMessages, message]
        }
      };
    });
  },
  
  updateMessageStatus: (messageId: string, chatId: string, updates: Partial<IMessage>) => {
    set((state) => {
      const chatMessages = state.messages[chatId] || [];
      const updatedMessages = chatMessages.map(msg => 
        msg._id === messageId ? { ...msg, ...updates } : msg
      );
      
      return {
        messages: { ...state.messages, [chatId]: updatedMessages }
      };
    });
  },
  
  setTypingStatus: (chatId: string | null) => {
    set({ typingIn: chatId });
  },
  
  updateChatTypingStatus: (chatId: string, userId: string, isTyping: boolean) => {
    set((state) => {
      // Update typing status in chat list
      const updatedChats = state.chats.map(chat => {
        if (chat._id === chatId) {
          return {
            ...chat,
            typing: isTyping,
            typingUserId: isTyping ? userId : undefined
          };
        }
        return chat;
      });
      
      // Also update active chat if it's the same one
      const updatedActiveChat = state.activeChat && state.activeChat._id === chatId
        ? { 
            ...state.activeChat, 
            typing: isTyping,
            typingUserId: isTyping ? userId : undefined
          }
        : state.activeChat;
      
      return {
        chats: updatedChats,
        activeChat: updatedActiveChat
      };
    });
  },
  
  updateUserOnlineStatus: (userId: string, isOnline: boolean) => {
    set((state) => {
      // Find all chats with this user
      const updatedChats = state.chats.map(chat => {
        // Check if the user is a participant in this chat
        const isParticipant = chat.participants.some(p => p._id === userId);
        
        if (isParticipant && chat.participants.length === 2) {
          // In a 1-on-1 chat, set the chat's online status
          return { ...chat, online: isOnline };
        }
        return chat;
      });
      
      // Update active chat if applicable
      let updatedActiveChat = state.activeChat;
      if (state.activeChat && state.activeChat.participants.some(p => p._id === userId)) {
        updatedActiveChat = { ...state.activeChat, online: isOnline };
      }
      
      return {
        chats: updatedChats,
        activeChat: updatedActiveChat
      };
    });
  },
  
  clearError: () => set({ error: null })
}));

export default useChatStore;