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

// Response interceptor for automatic error logging & graceful session expiry
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorMsg = error.response?.data?.message || error.message;
    console.warn('[ProjectXia API Interceptor]:', errorMsg);

    // If token expired or signature mismatch (401), broadcast auth expired event
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      const isAuthError =
        errorMsg.includes('expired') ||
        errorMsg.includes('signature') ||
        errorMsg.includes('invalid') ||
        errorMsg.includes('Unauthorized') ||
        errorMsg.includes('Bearer token');

      if (isAuthError) {
        try {
          sessionStorage.removeItem('projectxia_token');
          sessionStorage.removeItem('projectxia_user');
          localStorage.removeItem('projectxia_token');
          localStorage.removeItem('projectxia_user');
        } catch (e) {}

        window.dispatchEvent(
          new CustomEvent('projectxia_auth_expired', {
            detail: { message: errorMsg },
          })
        );
      }
    }

    return Promise.reject(error);
  }
);

export default api;
