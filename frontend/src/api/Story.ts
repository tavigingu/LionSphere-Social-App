import api from './axiosConfig';
import { IStory, IStoryGroup } from '../types/StoryTypes';
import axios from 'axios';

// Define a proper interface for the user who liked a story
interface StoryLiker {
  _id: string;
  username: string;
  profilePicture?: string;
}

/**
 * Get stories for timeline (user and friends)
 */
export const getTimelineStories = async (userId: string): Promise<IStoryGroup[]> => {
  try {
    console.log("Fetching timeline stories for user:", userId);
    const response = await api.get(`/story/${userId}/timeline`);
    
    console.log("Timeline stories response status:", response.status);
    
    if (response.data.success) {
      // Log one story image URL for debugging
      if (response.data.storyGroups && 
          response.data.storyGroups.length > 0 && 
          response.data.storyGroups[0].stories && 
          response.data.storyGroups[0].stories.length > 0) {
          
        console.log("First story image URL:", 
          response.data.storyGroups[0].stories[0].image.substring(0, 50) + '...');
      }
      
      return response.data.storyGroups;
    } else {
      console.error("Failed to fetch stories:", response.data.message);
      throw new Error(response.data.message || 'Failed to fetch stories');
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error fetching timeline stories:', error.response?.data);
      throw new Error(error.response?.data?.message || 'Error fetching timeline stories');
    }
    console.error('Unexpected error fetching timeline stories:', error);
    throw error;
  }
};

/**
 * Create a new story with improved error handling
 */
export const createStory = async (storyData: {
  userId: string;
  image: string;
  caption?: string;
}): Promise<IStory> => {
  try {
    console.log("Creating story with data:", {
      userId: storyData.userId,
      hasImage: !!storyData.image,
      imageUrlLength: storyData.image?.length || 0,
      caption: storyData.caption ? `${storyData.caption.substring(0, 20)}...` : undefined
    });
    
    // Validate the image URL before sending
    if (!storyData.image || !storyData.image.startsWith('http')) {
      throw new Error('Invalid image URL for story');
    }
    
    const response = await api.post(`/story`, storyData);
    
    console.log("Create story response status:", response.status);
    
    if (response.data.success) {
      console.log("Story created successfully with ID:", response.data.story._id);
      return response.data.story;
    } else {
      console.error("Failed to create story:", response.data.message);
      throw new Error(response.data.message || 'Failed to create story');
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error creating story:', error.response?.data);
      throw new Error(error.response?.data?.message || 'Error creating story');
    }
    console.error('Unexpected error creating story:', error);
    throw error;
  }
};

/**
 * Mark a story as viewed
 */
export const viewStory = async (storyId: string, userId: string): Promise<void> => {
  try {
    console.log("Marking story as viewed:", storyId, "by user:", userId);
    const response = await api.put(`/story/${storyId}/view`, { userId });
    
    if (!response.data.success) {
      console.error("Failed to mark story as viewed:", response.data.message);
      throw new Error(response.data.message || 'Failed to mark story as viewed');
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error marking story as viewed:', error.response?.data);
      throw new Error(error.response?.data?.message || 'Error marking story as viewed');
    }
    console.error('Unexpected error marking story as viewed:', error);
    throw error;
  }
};

/**
 * Like or unlike a story
 */
export const likeStory = async (storyId: string, userId: string): Promise<{
  action: 'liked' | 'unliked';
  story: IStory;
}> => {
  try {
    console.log("Toggling like for story:", storyId, "by user:", userId);
    const response = await api.put(`/story/${storyId}/like`, { userId });
    
    if (response.data.success) {
      console.log("Story like toggled successfully. Action:", response.data.action);
      return {
        action: response.data.action,
        story: response.data.story
      };
    } else {
      console.error("Failed to like/unlike story:", response.data.message);
      throw new Error(response.data.message || 'Failed to like/unlike story');
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error liking/unliking story:', error.response?.data);
      throw new Error(error.response?.data?.message || 'Error liking/unliking story');
    }
    console.error('Unexpected error liking/unliking story:', error);
    throw error;
  }
};

/**
 * Get users who liked a story
 */
export const getStoryLikes = async (storyId: string): Promise<StoryLiker[]> => {
  try {
    console.log("Fetching likes for story:", storyId);
    const response = await api.get(`/story/${storyId}/likes`);
    
    if (response.data.success) {
      console.log("Story likes fetched successfully. Count:", response.data.likes.length);
      return response.data.likes;
    } else {
      console.error("Failed to fetch story likes:", response.data.message);
      throw new Error(response.data.message || 'Failed to fetch story likes');
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error fetching story likes:', error.response?.data);
      throw new Error(error.response?.data?.message || 'Error fetching story likes');
    }
    console.error('Unexpected error fetching story likes:', error);
    throw error;
  }
};

/**
 * Delete a story
 */
export const deleteStory = async (storyId: string, userId: string): Promise<void> => {
  try {
    console.log("Deleting story:", storyId, "by user:", userId);
    const response = await api.delete(`/story/${storyId}`, {
      data: { userId }
    });
    
    if (!response.data.success) {
      console.error("Failed to delete story:", response.data.message);
      throw new Error(response.data.message || 'Failed to delete story');
    } else {
      console.log("Story deleted successfully");
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error deleting story:', error.response?.data);
      throw new Error(error.response?.data?.message || 'Error deleting story');
    }
    console.error('Unexpected error deleting story:', error);
    throw error;
  }
};