// Chat participant user information
export interface IChatUser {
    _id: string;
    username: string;
    profilePicture?: string;
    firstname?: string;
    lastname?: string;
  }
  
  // Message info
  export interface IMessage {
    _id: string;
    chatId: string;
    senderId: string;
    text: string;
    image?: string;
    readBy: string[];
    replyTo?: string;
    createdAt: string;
    updatedAt: string;
    
    // Additional fields for UI
    sender?: {
      username: string;
      profilePicture?: string;
    };
    replyToMessage?: IMessage; // The message this is replying to
    sending?: boolean; // Local state for optimistic UI updates
    failed?: boolean; // Local state for failed message sending
  }
  
  // Chat info
  export interface IChat {
    _id: string;
    participants: IChatUser[];
    latestMessage?: IMessage;
    unreadCount: number;
    updatedAt: string;
    
    // Additional fields for UI
    typing?: boolean; // Someone is typing in this chat
    typingUserId?: string; // Which user is typing
    online?: boolean; // Is the other participant online
  }
  
  // ChatState for Zustand store
  export interface ChatState {
    chats: IChat[];
    activeChat: IChat | null;
    messages: Record<string, IMessage[]>; // Maps chatId to messages
    loading: boolean;
    messagesLoading: boolean;
    error: string | null;
    
    // Pagination info
    messagesPagination: Record<string, {
      page: number;
      hasMore: boolean;
      totalMessages: number;
    }>;
    
    // Local typing state
    typingIn: string | null;
  }
  
  // Socket connection state
  export interface SocketState {
    connected: boolean;
    onlineUsers: string[];
    initialConnectionEstablished: boolean;
  }