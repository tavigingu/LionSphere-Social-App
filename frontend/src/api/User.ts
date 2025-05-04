import api from './axiosConfig';
import { IUser } from '../types/AuthTypes';
import axios from 'axios';

/**
 * Get user information by ID
 */
export const getUser = async (userId: string): Promise<IUser> => {
  try {
    const response = await api.get(`/user/${userId}`);
    
    if (response.data.success) {
      return response.data.user;
    } else {
      throw new Error(response.data.message || 'Failed to fetch user data');
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error fetching user:', error.response?.data);
      throw new Error(error.response?.data?.message || 'Error fetching user');
    }
    throw error;
  }
};

/**
 * Follow a user
 */
export const followUser = async (userId: string, currentUserId: string): Promise<void> => {
  try {
    console.log(`Attempting to follow user ${userId} by user ${currentUserId}`);
    
    const response = await api.post(`/user/${userId}/follow`, { _id: currentUserId });

    console.log('Follow response:', response.data);

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to follow user');
    }
    
    console.log('Successfully followed user, notification should be created on backend');
    
    // Optional: Manually check if notification was created after a short delay
    setTimeout(async () => {
      try {
        const notificationsResponse = await api.get(`/notification/${userId}`);
        console.log('Recent notifications for recipient:', 
          notificationsResponse.data.notifications
          .filter((n: { type: string }) => n.type === 'follow')
            .slice(0, 3)
        );
      } catch (err) {
        console.error('Error checking notifications after follow:', err);
      }
    }, 1000);
    
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Follow user failed:', error.response?.data);
      throw new Error(error.response?.data?.message || 'Failed to follow user');
    }
    throw error;
  }
};

/**
 * Unfollow a user
 */
export const unfollowUser = async (userId: string, currentUserId: string): Promise<void> => {
  try {
    const response = await api.post(`/user/${userId}/unfollow`, { _id: currentUserId });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to unfollow user');
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Unfollow user failed:', error.response?.data);
      throw new Error(error.response?.data?.message || 'Failed to unfollow user');
    }
    throw error;
  }
};

/**
 * Update user profile
 */
export const updateUser = async (userId: string, currentUserId: string, userData: Partial<IUser>): Promise<IUser> => {
  try {
    const response = await api.put(`/user/${userId}`, { 
      ...userData,
      _id: currentUserId
    });

    if (response.data.success) {
      return response.data.user;
    } else {
      throw new Error(response.data.message || 'Failed to update user');
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Update user failed:', error.response?.data);
      throw new Error(error.response?.data?.message || 'Failed to update user');
    }
    throw error;
  }
};

/**
 * Check if user follows another user
 */
export const checkFollowStatus = (user: IUser, currentUserId: string): boolean => {
  if (!user.followers) return false;
  
  // Ensure we're working with an array of strings
  const followers = user.followers as string[];
  return followers.includes(currentUserId);
};

/**
 * Get suggested users
 */
export const getSuggestedUsers = async (userId: string): Promise<IUser[]> => {
  try {
    if (!userId || userId === 'suggestions' || typeof userId !== 'string') {
      throw new Error('ID-ul utilizatorului nu este valid');
    }

    console.log(`Trimit cerere pentru utilizatori sugerați cu userId: ${userId}`);
    const response = await api.get(`/user/suggestions?userId=${userId}`);
    
    console.log(response.data);
    
    if (response.data.success) {
      return response.data.users;
    } else {
      throw new Error(response.data.message || 'Failed to fetch suggested users');
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error fetching suggested users:', error.response?.data);
      throw new Error(error.response?.data?.message || 'Error fetching suggested users');
    }
    throw error;
  }
};