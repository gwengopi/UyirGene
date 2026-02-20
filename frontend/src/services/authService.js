import api, { setAuthHeader, clearAuthHeader } from './api';

const AUTH_ENDPOINTS = {
  REGISTER: '/api/auth/register',
  LOGIN: '/api/auth/login',
  GOOGLE: '/api/auth/google',
  ME: '/api/auth/me',
};

/**
 * Register a new user
 */
export async function register(userData) {
  const response = await api.post(AUTH_ENDPOINTS.REGISTER, userData);
  return response.data;
}

/**
 * Login user with email and password (JWT)
 */
export async function login(email, password) {
  const response = await api.post(AUTH_ENDPOINTS.LOGIN, { email, password });
  const { token, user } = response.data;
  setAuthHeader(token);
  return { token, user };
}

/**
 * Login with Google (supports both credential and access token)
 */
export async function googleLogin({ credential, accessToken }) {
  const response = await api.post(AUTH_ENDPOINTS.GOOGLE, { credential, accessToken });
  const { token, user } = response.data;
  setAuthHeader(token);
  return { token, user };
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser() {
  const response = await api.get(AUTH_ENDPOINTS.ME);
  return response.data;
}

/**
 * Update current user profile (name, password)
 */
export async function updateProfile(profileData) {
  const response = await api.put(AUTH_ENDPOINTS.ME, profileData);
  return response.data;
}

/**
 * Logout user - clears auth token
 */
export function logout() {
  clearAuthHeader();
}

/**
 * Validate if user has required role
 */
export function hasRole(user, allowedRoles) {
  if (!user || !user.role) return false;
  return allowedRoles.includes(user.role);
}

export default {
  register,
  login,
  googleLogin,
  getCurrentUser,
  updateProfile,
  logout,
  hasRole,
};
