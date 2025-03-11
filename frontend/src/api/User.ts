import axios from 'axios';
import { IUser } from '../types/AuthTypes';

const BASE_URL = 'http://localhost:5001';

/**
 * Get user information by ID
 */
export const getUser = async (userId: string): Promise<IUser> => {
  try {
    const response = await axios.get(`${BASE_URL}/user/${userId}`);
    
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
    const response = await axios.post(
      `${BASE_URL}/user/${userId}/follow`,
      { _id: currentUserId },
      { withCredentials: true }
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to follow user');
    }
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
    const response = await axios.post(
      `${BASE_URL}/user/${userId}/unfollow`,
      { _id: currentUserId },
      { withCredentials: true }
    );

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
    const response = await axios.put(
      `${BASE_URL}/user/${userId}`,
      { 
        ...userData,
        _id: currentUserId
      },
      { withCredentials: true }
    );

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