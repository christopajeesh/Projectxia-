import axios from 'axios';

const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

// In production (https://www.projectxia.com), never call insecure http://localhost:5000
let rawBase = '';
if (isLocalhost) {
  rawBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
} else {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && envUrl.startsWith('https://')) {
    rawBase = envUrl;
  } else {
    rawBase = '';
  }
}

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

// Request interceptor to attach JWT token (Session-Scoped)
api.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined'
      ? sessionStorage.getItem('projectxia_token') || localStorage.getItem('projectxia_token')
      : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for logging errors gracefully without breaking user session
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorMsg = error.response?.data?.message || error.message;
    console.warn('[ProjectXia API Interceptor]:', errorMsg);
    return Promise.reject(error);
  }
);

export default api;
