import axios from 'axios';

const rawUrl = import.meta.env.VITE_API_URL || 'https://dentex-backend-735980809691.asia-south1.run.app';
export const API_BASE_URL = rawUrl.endsWith('/api') ? rawUrl : `${rawUrl}/api`;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach Authorization header automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('dentex_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle global errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
