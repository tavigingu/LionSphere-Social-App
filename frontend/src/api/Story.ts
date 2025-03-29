// frontend/src/api/Story.ts
import axios from 'axios';
import { IStory, IStoryGroup } from '../types/StoryTypes';

const BASE_URL = 'http://localhost:5001';

// Obține stories pentru timeline (utilizator și prieteni)
export const getTimelineStories = async (userId: string): Promise<IStoryGroup[]> => {
    try {
        const response = await axios.get(`${BASE_URL}/story/${userId}/timeline`);
        
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

// Crează un nou story
export const createStory = async (storyData: {
    userId: string;
    image: string;
    caption?: string;
}): Promise<IStory> => {
    try {
        const response = await axios.post(`${BASE_URL}/story`, storyData);
        
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

// Marchează un story ca vizualizat
export const viewStory = async (storyId: string, userId: string): Promise<void> => {
    try {
        const response = await axios.put(`${BASE_URL}/story/${storyId}/view`, { userId });
        
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

// Șterge un story
export const deleteStory = async (storyId: string, userId: string): Promise<void> => {
    try {
        const response = await axios.delete(`${BASE_URL}/story/${storyId}`, {
            data: { userId }
        });
        
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