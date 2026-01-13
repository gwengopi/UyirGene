import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Initialize default header from localStorage if present
const stored = localStorage.getItem('uyir_auth');
if (stored) {
  api.defaults.headers.common['Authorization'] = stored;
}

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('uyir_auth');
    if (token) {
      config.headers['Authorization'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor with error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;

    if (response) {
      // Handle specific error codes
      switch (response.status) {
        case 401:
          // Unauthorized - clear auth and redirect to login
          clearAuthHeader();
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          break;
        case 403:
          // Forbidden - user doesn't have permission
          console.error('Access forbidden');
          break;
        case 404:
          console.error('Resource not found');
          break;
        case 500:
          console.error('Server error');
          break;
        default:
          break;
      }

      // Extract error message from response
      const errorMessage = response.data?.message || response.data?.error || 'An error occurred';
      error.message = errorMessage;
    } else if (error.request) {
      // Network error
      error.message = 'Network error. Please check your connection.';
    }

    return Promise.reject(error);
  }
);

export function setAuthHeader(token) {
  localStorage.setItem('uyir_auth', token);
  api.defaults.headers.common['Authorization'] = token;
}

export function clearAuthHeader() {
  localStorage.removeItem('uyir_auth');
  delete api.defaults.headers.common['Authorization'];
}

export function getAuthToken() {
  return localStorage.getItem('uyir_auth');
}

export function isAuthenticated() {
  return !!getAuthToken();
}

export default api;
