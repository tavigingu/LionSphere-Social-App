import { create } from 'zustand';
import { INotification, NotificationState } from '../types/NotificationTypes';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification
} from '../api/Notification';

interface NotificationStore extends NotificationState {
  fetchNotifications: (userId: string) => Promise<void>;
  fetchUnreadCount: (userId: string) => Promise<void>;
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  markAllNotificationsAsRead: (userId: string) => Promise<void>;
  deleteNotification: (notificationId: string, userId: string) => Promise<void>;
  clearError: () => void;
  resetState: () => void;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null
};

const useNotificationStore = create<NotificationStore>((set) => ({
  ...initialState,

  fetchNotifications: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      const result = await getNotifications(userId);
      set({
        notifications: result.notifications,
        unreadCount: result.unreadCount,
        loading: false
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to fetch notifications';
      set({ error: errorMessage, loading: false });
    }
  },

  fetchUnreadCount: async (userId: string) => {
    try {
      const count = await getUnreadCount(userId);
      set({ unreadCount: count });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to fetch unread count';
      set({ error: errorMessage });
    }
  },

  markNotificationAsRead: async (notificationId: string) => {
    try {
      await markAsRead(notificationId);
      
      // Update local state
      set((state) => ({
        notifications: state.notifications.map(notification => 
          notification._id === notificationId 
            ? { ...notification, read: true } 
            : notification
        ),
        unreadCount: Math.max(0, state.unreadCount - 1)
      }));
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to mark notification as read';
      set({ error: errorMessage });
    }
  },

  markAllNotificationsAsRead: async (userId: string) => {
    try {
      await markAllAsRead(userId);
      
      // Update local state
      set((state) => ({
        notifications: state.notifications.map(notification => 
          ({ ...notification, read: true })
        ),
        unreadCount: 0
      }));
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to mark all notifications as read';
      set({ error: errorMessage });
    }
  },

  deleteNotification: async (notificationId: string, userId: string) => {
    try {
      await deleteNotification(notificationId, userId);
      
      // Update local state
      set((state) => {
        const notification = state.notifications.find(n => n._id === notificationId);
        const unreadAdjustment = notification && !notification.read ? 1 : 0;
        
        return {
          notifications: state.notifications.filter(n => n._id !== notificationId),
          unreadCount: Math.max(0, state.unreadCount - unreadAdjustment)
        };
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to delete notification';
      set({ error: errorMessage });
    }
  },

  clearError: () => set({ error: null }),
  
  resetState: () => set(initialState)
}));

export default useNotificationStore;