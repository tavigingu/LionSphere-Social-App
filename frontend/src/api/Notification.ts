// src/api/Notification.ts
import api from './axiosConfig';
import axios from 'axios';
import { INotification } from '../types/NotificationTypes';

// Get notifications for a user
export const getNotifications = async (userId: string): Promise<{
  notifications: INotification[];
  unreadCount: number;
}> => {
  try {
    const response = await api.get(`/notification/${userId}`);
    
    if (response.data.success) {
      return {
        notifications: response.data.notifications,
        unreadCount: response.data.unreadCount
      };
    } else {
      throw new Error(response.data.message || 'Failed to fetch notifications');
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error fetching notifications:', error.response?.data);
      throw new Error(error.response?.data?.message || 'Error fetching notifications');
    }
    throw error;
  }
};

// Get unread notification count
export const getUnreadCount = async (userId: string): Promise<number> => {
  try {
    const response = await api.get(`/notification/${userId}/unread`);
    
    if (response.data.success) {
      return response.data.unreadCount;
    } else {
      throw new Error(response.data.message || 'Failed to fetch unread count');
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error fetching unread count:', error.response?.data);
      throw new Error(error.response?.data?.message || 'Error fetching unread count');
    }
    throw error;
  }
};

// Mark a notification as read
export const markAsRead = async (notificationId: string): Promise<void> => {
  try {
    const response = await api.put(`/notification/${notificationId}/read`, {});
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to mark notification as read');
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error marking notification as read:', error.response?.data);
      throw new Error(error.response?.data?.message || 'Error marking notification as read');
    }
    throw error;
  }
};

// Mark all notifications as read
export const markAllAsRead = async (userId: string): Promise<void> => {
  try {
    const response = await api.put(`/notification/read-all`, {
      allNotifications: true,
      userId
    });
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to mark all notifications as read');
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error marking all notifications as read:', error.response?.data);
      throw new Error(error.response?.data?.message || 'Error marking all notifications as read');
    }
    throw error;
  }
};

// Create a notification
export const createNotification = async (notification: {
  recipientId: string;
  senderId: string;
  type: 'like' | 'comment' | 'follow' | 'mention';
  postId?: string;
  commentId?: string;
  message: string;
}): Promise<INotification> => {
  try {
    const response = await api.post(`/notification`, notification);
    
    if (response.data.success) {
      return response.data.notification;
    } else {
      throw new Error(response.data.message || 'Failed to create notification');
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error creating notification:', error.response?.data);
      throw new Error(error.response?.data?.message || 'Error creating notification');
    }
    throw error;
  }
};

// Delete a notification
export const deleteNotification = async (notificationId: string, userId: string): Promise<void> => {
  try {
    const response = await api.delete(`/notification/${notificationId}`, {
      data: { userId }
    });
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to delete notification');
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error deleting notification:', error.response?.data);
      throw new Error(error.response?.data?.message || 'Error deleting notification');
    }
    throw error;
  }
};