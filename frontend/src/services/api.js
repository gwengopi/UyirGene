import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// ── Simple in-memory GET cache ────────────────────────────────────────────────
// Usage: api.get('/path', { cache: true }) or api.get('/path', { cacheTTL: 60000 })
const _cache = new Map();
const DEFAULT_TTL = 30_000; // 30 s

export function clearApiCache() {
  _cache.clear();
}

export function invalidateCacheKey(url) {
  for (const key of _cache.keys()) {
    if (key.startsWith(url)) _cache.delete(key);
  }
}

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

// Request interceptor – auth header + GET cache short-circuit
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('uyir_auth');
    if (token) {
      config.headers['Authorization'] = token;
    }
    // For FormData, delete Content-Type so the browser sets multipart/form-data with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    // Serve from cache for opted-in GET requests
    if (config.method === 'get' && config.cache) {
      const cacheKey = config.baseURL + config.url + JSON.stringify(config.params || {});
      const entry = _cache.get(cacheKey);
      if (entry && Date.now() - entry.ts < (config.cacheTTL ?? DEFAULT_TTL)) {
        // Cancel the real request and resolve with cached data via adapter trick
        config.adapter = () => Promise.resolve({ ...entry.response, config });
      }
      config._cacheKey = cacheKey;
      config._cacheTTL = config.cacheTTL ?? DEFAULT_TTL;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Track if we're already handling a 401 to prevent multiple redirects
let isHandling401 = false;

// Response interceptor – populate cache + error handling
api.interceptors.response.use(
  (response) => {
    // Store successful GET responses that opted in
    const { _cacheKey, _cacheTTL } = response.config;
    if (_cacheKey) {
      _cache.set(_cacheKey, { ts: Date.now(), ttl: _cacheTTL, response });
    }
    return response;
  },
  (error) => {
    const { response, config } = error;

    if (response) {
      // Handle specific error codes
      switch (response.status) {
        case 401:
          // Only clear auth and redirect if:
          // 1. We're not already handling a 401
          // 2. There was actually a token (user was logged in)
          // 3. We're not on certain paths that shouldn't trigger redirect
          const currentToken = localStorage.getItem('uyir_auth');
          const requestUrl = config?.url || '';

          // Don't redirect for these non-critical calls - let the page handle them gracefully
          const isNonCriticalCall =
            requestUrl.includes('/progress') ||
            requestUrl.includes('/certificate') ||
            requestUrl.includes('/enrolled') ||
            requestUrl.includes('/enroll') ||
            requestUrl.includes('/videos');

          if (isNonCriticalCall) {
            console.warn('401 on non-critical call, not redirecting:', requestUrl);
            break;
          }

          if (!isHandling401 && currentToken && window.location.pathname !== '/login') {
            isHandling401 = true;
            clearAuthHeader();
            // Small delay to prevent race conditions with multiple 401s
            setTimeout(() => {
              window.location.href = '/login';
              isHandling401 = false;
            }, 100);
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
  clearApiCache();
}

export function getAuthToken() {
  return localStorage.getItem('uyir_auth');
}

export function isAuthenticated() {
  return !!getAuthToken();
}

export function getApiBaseUrl() {
  return api.defaults.baseURL || '';
}

export default api;
