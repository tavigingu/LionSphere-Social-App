// frontend/src/api/Auth.ts
import axios from 'axios';
import { LoginCredentials, RegisterCredentials, AuthResponse } from '../types/AuthTypes';

const BASE_URL = 'http://localhost:5001/auth';

export const loginUser = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  try {
    const response = await axios.post<AuthResponse>(`${BASE_URL}/login`, credentials, {
      withCredentials: true
    });
    console.log(response.data);

    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
    }
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
        console.error('Login failed:', error.response?.data);
        throw new Error(`Login failed: ${error.response?.data?.message || 'Unknown error'}`);
      }
    throw error;
  }
};

export const registerUser = async (userData: RegisterCredentials): Promise<AuthResponse> => {
  try {
    const response = await axios.post<AuthResponse>(`${BASE_URL}/register`, userData, {
      withCredentials: true
    });

    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
    }
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
        console.error('Login failed:', error.response?.data);
        throw new Error(`Login failed: ${error.response?.data?.message || 'Unknown error'}`);
      }
    throw error;
  }
};

export const logoutUser = async (): Promise<void> => {
  try {
    await axios.post(`${BASE_URL}/logout`, {}, {
      withCredentials: true
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
        console.error('Login failed:', error.response?.data);
        throw new Error(`Login failed: ${error.response?.data?.message || 'Unknown error'}`);
      }
    throw error;
  }
};