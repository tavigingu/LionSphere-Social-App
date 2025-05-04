// src/api/axiosConfig.ts
import axios from 'axios';

const API_URL = 'http://localhost:5001';

// Creează o instanță axios de bază
export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important pentru cookie-uri
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor pentru cereri pentru a adăuga tokenul de autentificare
api.interceptors.request.use(
  (config) => {
    // Verifică dacă există un token în cookie-uri sau localStorage
    // Deoarece backend-ul tău pare să folosească cookie-uri, acest lucru poate să nu fie necesar
    // Dar îl adaug ca backup
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor pentru răspunsuri pentru a gestiona erorile comune
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Gestionează erorile de tip neautorizat (ex. redirecționare către login)
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;