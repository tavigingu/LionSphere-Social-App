// frontend/src/api/Story.ts
import axios from 'axios';
import { IStory, IStoryGroup } from '../types/StoryTypes';

const BASE_URL = 'http://localhost:5001';

// Get stories for timeline (user and friends)
export const getTimelineStories = async (userId: string): Promise<IStoryGroup[]> => {
    try {
        console.log("Fetching timeline stories for user:", userId);
        const response = await axios.get(`${BASE_URL}/story/${userId}/timeline`);
        
        console.log("Timeline stories response:", response.data);
        
        if (response.data.success) {
            return response.data.storyGroups;
        } else {
            throw new Error(response.data.message || 'Failed to fetch stories');
        }
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Error fetching timeline stories:', error.response?.data);
            throw new Error(error.response?.data?.message || 'Error fetching timeline stories');
        }
        throw error;
    }
};

// Create a new story
export const createStory = async (storyData: {
    userId: string;
    image: string;
    caption?: string;
}): Promise<IStory> => {
    try {
        console.log("Creating story with data:", storyData);
        const response = await axios.post(`${BASE_URL}/story`, storyData);
        
        console.log("Create story response:", response.data);
        
        if (response.data.success) {
            return response.data.story;
        } else {
            throw new Error(response.data.message || 'Failed to create story');
        }
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Error creating story:', error.response?.data);
            throw new Error(error.response?.data?.message || 'Error creating story');
        }
        throw error;
    }
};

// Mark a story as viewed
export const viewStory = async (storyId: string, userId: string): Promise<void> => {
    try {
        console.log("Marking story as viewed:", storyId, "by user:", userId);
        const response = await axios.put(`${BASE_URL}/story/${storyId}/view`, { userId });
        
        console.log("View story response:", response.data);
        
        if (!response.data.success) {
            throw new Error(response.data.message || 'Failed to mark story as viewed');
        }
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Error marking story as viewed:', error.response?.data);
            throw new Error(error.response?.data?.message || 'Error marking story as viewed');
        }
        throw error;
    }
};

// Delete a story
export const deleteStory = async (storyId: string, userId: string): Promise<void> => {
    try {
        console.log("Deleting story:", storyId, "by user:", userId);
        const response = await axios.delete(`${BASE_URL}/story/${storyId}`, {
            data: { userId }
        });
        
        console.log("Delete story response:", response.data);
        
        if (!response.data.success) {
            throw new Error(response.data.message || 'Failed to delete story');
        }
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Error deleting story:', error.response?.data);
            throw new Error(error.response?.data?.message || 'Error deleting story');
        }
        throw error;
    }
};