/**
 * Obține distribuția interacțiunilor
 */
export const getEngagementByType = async (
    userId: string, 
    timeframe: TimeframeType = 'month'
  ): Promise<EngagementType[]> => {
    try {
      const response = await axios.get(`${BASE_URL}/statistics/user/${userId}/engagement-types`, {
        params: { timeframe }
      });
      
      if (response.data.success) {
        return response.data.engagementByType as EngagementType[];
      } else {
        throw new Error(response.data.message || 'Eroare la obținerea distribuției interacțiunilor');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Eroare la obținerea distribuției interacțiunilor:', error.response?.data);
        throw new Error(error.response?.data?.message || 'Eroare la obținerea distribuției interacțiunilor');
      }
      throw error;
    }
  };
  
  /**
   * Obține activitatea recentă
   */
  export const getRecentActivity = async (
    userId: string, 
    limit: number = 10
  ): Promise<RecentActivity[]> => {
    try {
      const response = await axios.get(`${BASE_URL}/statistics/user/${userId}/activity`, {
        params: { limit }
      });
      
      if (response.data.success) {
        return response.data.recentActivity as RecentActivity[];
      } else {
        throw new Error(response.data.message || 'Eroare la obținerea activității recente');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Eroare la obținerea activității recente:', error.response?.data);
        throw new Error(error.response?.data?.message || 'Eroare la obținerea activității recente');
      }
      throw error;
    }
  };// frontend/src/api/Statistics.ts
  import axios from 'axios';
  import {
    TimeframeType,
    StatsData,
    FollowersSummary,
    PostsSummary,
    PostEngagement,
    PostsByDay,
    EngagementType,
    TopPost,
    RecentActivity
  } from '../types/StatisticsTypes';
  
  const BASE_URL = 'http://localhost:5001';
  
  /**
   * Obține toate statisticile pentru un utilizator
   */
  export const getUserStatistics = async (
    userId: string, 
    timeframe: TimeframeType = 'month'
  ): Promise<StatsData> => {
    try {
      console.log(`Obțin statistici pentru utilizatorul ${userId}, perioada ${timeframe}`);
      const response = await axios.get(`${BASE_URL}/statistics/user/${userId}`, {
        params: { timeframe }
      });
      
      if (response.data.success) {
        return response.data.stats as StatsData;
      } else {
        throw new Error(response.data.message || 'Eroare la obținerea statisticilor');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Eroare la obținerea statisticilor:', error.response?.data);
        throw new Error(error.response?.data?.message || 'Eroare la obținerea statisticilor');
      }
      throw error;
    }
  };
  
  /**
   * Obține date despre urmăritori
   */
  export const getFollowersData = async (
    userId: string, 
    timeframe: TimeframeType = 'month'
  ): Promise<FollowersSummary> => {
    try {
      const response = await axios.get(`${BASE_URL}/statistics/user/${userId}/followers`, {
        params: { timeframe }
      });
      
      if (response.data.success) {
        return response.data.followersSummary as FollowersSummary;
      } else {
        throw new Error(response.data.message || 'Eroare la obținerea datelor despre urmăritori');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Eroare la obținerea datelor despre urmăritori:', error.response?.data);
        throw new Error(error.response?.data?.message || 'Eroare la obținerea datelor despre urmăritori');
      }
      throw error;
    }
  };
  
  /**
   * Obține date despre postări
   */
  export const getPostsData = async (
    userId: string, 
    timeframe: TimeframeType = 'month'
  ): Promise<PostsSummary> => {
    try {
      const response = await axios.get(`${BASE_URL}/statistics/user/${userId}/posts`, {
        params: { timeframe }
      });
      
      if (response.data.success) {
        return response.data.postsSummary as PostsSummary;
      } else {
        throw new Error(response.data.message || 'Eroare la obținerea datelor despre postări');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Eroare la obținerea datelor despre postări:', error.response?.data);
        throw new Error(error.response?.data?.message || 'Eroare la obținerea datelor despre postări');
      }
      throw error;
    }
  };
  
  /**
   * Obține cele mai populare postări
   */
  export const getTopPosts = async (
    userId: string, 
    limit: number = 5
  ): Promise<TopPost[]> => {
    try {
      const response = await axios.get(`${BASE_URL}/statistics/post/${userId}/top`, {
        params: { limit }
      });
      
      if (response.data.success) {
        return response.data.topPosts as TopPost[];
      } else {
        throw new Error(response.data.message || 'Eroare la obținerea celor mai populare postări');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Eroare la obținerea celor mai populare postări:', error.response?.data);
        throw new Error(error.response?.data?.message || 'Eroare la obținerea celor mai populare postări');
      }
      throw error;
    }
  };
  
  /**
   * Obține distribuția postărilor după ziua săptămânii
   */
  export const getPostsByDay = async (
    userId: string
  ): Promise<PostsByDay[]> => {
    try {
      const response = await axios.get(`${BASE_URL}/statistics/post/${userId}/byday`);
      
      if (response.data.success) {
        return response.data.postsByDay as PostsByDay[];
      } else {
        throw new Error(response.data.message || 'Eroare la obținerea distribuției postărilor');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Eroare la obținerea distribuției postărilor:', error.response?.data);
        throw new Error(error.response?.data?.message || 'Eroare la obținerea distribuției postărilor');
      }
      throw error;
    }
  };