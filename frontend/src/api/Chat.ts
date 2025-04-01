import axios from 'axios';
import { IChat, IMessage, IChatUser } from '../types/ChatTypes';

const BASE_URL = 'http://localhost:5001';

// Get user's chats
export const getUserChats = async (userId: string): Promise<IChat[]> => {
  try {
    const response = await axios.get(`${BASE_URL}/chat/${userId}`);
    
    if (response.data.success) {
      return response.data.chats;
    } else {
      throw new Error(response.data.message || 'Failed to fetch chats');
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error fetching chats:', error.response?.data);
      throw new Error(error.response?.data?.message || 'Error fetching chats');
    }
    throw error;
  }
};

// Get or create a chat between two users
export const getOrCreateChat = async (userId: string, otherUserId: string): Promise<IChat> => {
  try {
    const response = await axios.post(`${BASE_URL}/chat`, {
      userId,
      otherUserId
    });
    
    if (response.data.success) {
      return response.data.chat;
    } else {
      throw new Error(response.data.message || 'Failed to create chat');
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error creating chat:', error.response?.data);
      throw new Error(error.response?.data?.message || 'Error creating chat');
    }
    throw error;
  }
};

// Mark chat as read for a user
export const markChatAsRead = async (chatId: string, userId: string): Promise<void> => {
  try {
    const response = await axios.put(`${BASE_URL}/chat/read`, {
      chatId,
      userId
    });
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to mark chat as read');
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error marking chat as read:', error.response?.data);
      throw new Error(error.response?.data?.message || 'Error marking chat as read');
    }
    throw error;
  }
};

// Delete chat (only removes for the current user)
export const deleteChat = async (chatId: string, userId: string): Promise<void> => {
  try {
    const response = await axios.delete(`${BASE_URL}/chat`, {
      data: { chatId, userId }
    });
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to delete chat');
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error deleting chat:', error.response?.data);
      throw new Error(error.response?.data?.message || 'Error deleting chat');
    }
    throw error;
  }
};

// Get messages for a specific chat
export const getChatMessages = async (chatId: string, page = 1, limit = 20): Promise<{
  messages: IMessage[];
  hasMore: boolean;
  page: number;
  totalMessages: number;
}> => {
  try {
    const response = await axios.get(`${BASE_URL}/message/${chatId}`, {
      params: { page, limit }
    });
    
    if (response.data.success) {
      return {
        messages: response.data.messages,
        hasMore: response.data.hasMore,
        page: response.data.page,
        totalMessages: response.data.totalMessages
      };
    } else {
      throw new Error(response.data.message || 'Failed to fetch messages');
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error fetching messages:', error.response?.data);
      throw new Error(error.response?.data?.message || 'Error fetching messages');
    }
    throw error;
  }
};

// Send a new message
export const sendMessage = async (messageData: {
  chatId: string;
  senderId: string;
  text: string;
  image?: string;
  replyTo?: string;
}): Promise<IMessage> => {
  try {
    const response = await axios.post(`${BASE_URL}/message`, messageData);
    
    if (response.data.success) {
      return response.data.sentMessage;
    } else {
      throw new Error(response.data.message || 'Failed to send message');
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error sending message:', error.response?.data);
      throw new Error(error.response?.data?.message || 'Error sending message');
    }
    throw error;
  }
};

// Delete a message
export const deleteMessage = async (messageId: string, userId: string): Promise<void> => {
  try {
    const response = await axios.delete(`${BASE_URL}/message`, {
      data: { messageId, userId }
    });
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to delete message');
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error deleting message:', error.response?.data);
      throw new Error(error.response?.data?.message || 'Error deleting message');
    }
    throw error;
  }
};

// Mark message as read
export const markMessageAsRead = async (messageId: string, userId: string): Promise<{
  unreadCount: number;
}> => {
  try {
    const response = await axios.put(`${BASE_URL}/message/read`, {
      messageId,
      userId
    });
    
    if (response.data.success) {
      return {
        unreadCount: response.data.unreadCount
      };
    } else {
      throw new Error(response.data.message || 'Failed to mark message as read');
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error marking message as read:', error.response?.data);
      throw new Error(error.response?.data?.message || 'Error marking message as read');
    }
    throw error;
  }
};