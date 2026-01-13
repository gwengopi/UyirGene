import api from './api';

const ADMIN_ENDPOINTS = {
  USERS: '/api/admin/users',
  USER_DETAIL: (id) => `/api/admin/users/${id}`,
  USER_ROLE: (id) => `/api/admin/users/${id}/role`,
  ANALYTICS: '/api/admin/analytics',
  ENROLLMENTS: '/api/admin/enrollments',
};

/**
 * Get all users (Admin only)
 * @returns {Promise<Array>} List of all users
 */
export async function getAllUsers() {
  const response = await api.get(ADMIN_ENDPOINTS.USERS);
  return response.data;
}

/**
 * Get a single user by ID (Admin only)
 * @param {number|string} id - User ID
 * @returns {Promise<Object>} User details
 */
export async function getUser(id) {
  const response = await api.get(ADMIN_ENDPOINTS.USER_DETAIL(id));
  return response.data;
}

/**
 * Update user role (Admin only)
 * @param {number|string} id - User ID
 * @param {string} role - New role (STUDENT, INSTRUCTOR, ADMIN)
 * @returns {Promise<Object>} Updated user
 */
export async function updateUserRole(id, role) {
  const response = await api.put(ADMIN_ENDPOINTS.USER_ROLE(id), { role });
  return response.data;
}

/**
 * Delete a user (Admin only)
 * @param {number|string} id - User ID
 * @returns {Promise<void>}
 */
export async function deleteUser(id) {
  await api.delete(ADMIN_ENDPOINTS.USER_DETAIL(id));
}

/**
 * Get analytics dashboard data (Admin only)
 * @returns {Promise<Object>} Analytics data
 */
export async function getAnalytics() {
  const response = await api.get(ADMIN_ENDPOINTS.ANALYTICS);
  return response.data;
}

/**
 * Get all enrollments (Admin only)
 * @returns {Promise<Array>} List of all enrollments
 */
export async function getAllEnrollments() {
  const response = await api.get(ADMIN_ENDPOINTS.ENROLLMENTS);
  return response.data;
}

/**
 * Get enrollment statistics
 * @param {Array} enrollments - List of enrollments
 * @returns {Object} Statistics object
 */
export function calculateEnrollmentStats(enrollments) {
  if (!enrollments || !Array.isArray(enrollments)) {
    return {
      total: 0,
      pending: 0,
      enrolled: 0,
      completed: 0,
    };
  }

  return {
    total: enrollments.length,
    pending: enrollments.filter((e) => e.status === 'PENDING').length,
    enrolled: enrollments.filter((e) => e.status === 'ENROLLED').length,
    completed: enrollments.filter((e) => e.status === 'COMPLETED').length,
  };
}

export default {
  getAllUsers,
  getUser,
  updateUserRole,
  deleteUser,
  getAnalytics,
  getAllEnrollments,
  calculateEnrollmentStats,
};
