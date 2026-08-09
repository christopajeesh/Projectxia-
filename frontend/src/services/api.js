import axios from 'axios';

const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

let rawBase = import.meta.env.VITE_API_URL || (isLocalhost ? 'http://localhost:5000' : '');
if (rawBase && rawBase.endsWith('/')) {
  rawBase = rawBase.slice(0, -1);
}

const API_BASE_URL = rawBase
  ? (rawBase.endsWith('/api') ? rawBase : `${rawBase}/api`)
  : '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 20000,
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('projectxia_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for automatic error logging
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.warn('[ProjectXia API Interceptor]:', error.response?.data?.message || error.message);
    return Promise.reject(error);
  }
);

export default api;
