import api, { setAuthHeader, clearAuthHeader } from './api';

const AUTH_ENDPOINTS = {
  REGISTER: '/api/auth/register',
  ME: '/api/auth/me',
};

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @param {string} userData.name - User's full name
 * @param {string} userData.email - User's email address
 * @param {string} userData.password - User's password
 * @param {string} userData.role - User's role (STUDENT, INSTRUCTOR, ADMIN)
 * @returns {Promise<Object>} Created user object
 */
export async function register(userData) {
  const response = await api.post(AUTH_ENDPOINTS.REGISTER, userData);
  return response.data;
}

/**
 * Login user with Basic Auth
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise<Object>} Object containing token and user data
 */
export async function login(email, password) {
  const token = 'Basic ' + btoa(`${email}:${password}`);
  setAuthHeader(token);

  try {
    const response = await api.get(AUTH_ENDPOINTS.ME);
    return { token, user: response.data };
  } catch (error) {
    clearAuthHeader();
    throw error;
  }
}

/**
 * Get current authenticated user
 * @returns {Promise<Object>} Current user data
 */
export async function getCurrentUser() {
  const response = await api.get(AUTH_ENDPOINTS.ME);
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
 * @param {Object} user - User object
 * @param {string[]} allowedRoles - Array of allowed roles
 * @returns {boolean} True if user has required role
 */
export function hasRole(user, allowedRoles) {
  if (!user || !user.role) return false;
  return allowedRoles.includes(user.role);
}

export default {
  register,
  login,
  getCurrentUser,
  logout,
  hasRole,
};
