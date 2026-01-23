import api from './api';

const ADMIN_ENDPOINTS = {
  USERS: '/api/admin/users',
  USER_DETAIL: (id) => `/api/admin/users/${id}`,
  USER_ROLE: (id) => `/api/admin/users/${id}/role`,
  USER_STATUS: (id) => `/api/admin/users/${id}/status`,
  USER_ENROLLMENTS: (id) => `/api/admin/users/${id}/enrollments`,
  ANALYTICS: '/api/admin/analytics',
  ENROLLMENTS: '/api/admin/enrollments',
  ENROLLMENT_DETAIL: (id) => `/api/admin/enrollments/${id}`,
  ENROLLMENT_COMPLETE: (id) => `/api/admin/enrollments/${id}/complete`,
  ENROLLMENT_MARKS: (id) => `/api/admin/enrollments/${id}/marks`,
  ENROLLMENT_PUBLISH_RESULT: (id) => `/api/admin/enrollments/${id}/publish-result`,
  ENROLLMENT_GENERATE_CERTIFICATE: (id) => `/api/admin/enrollments/${id}/generate-certificate`,
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
 * Toggle user enabled/disabled status (Admin only)
 * @param {number|string} id - User ID
 * @param {boolean} enabled - New enabled status
 * @returns {Promise<Object>} Updated user
 */
export async function updateUserStatus(id, enabled) {
  const response = await api.put(ADMIN_ENDPOINTS.USER_STATUS(id), { enabled });
  return response.data;
}

/**
 * Get enrollments for a specific user (Admin only)
 * @param {number|string} userId - User ID
 * @returns {Promise<Array>} List of user's enrollments
 */
export async function getUserEnrollments(userId) {
  const response = await api.get(ADMIN_ENDPOINTS.USER_ENROLLMENTS(userId));
  return response.data;
}

/**
 * Admin unenroll - delete an enrollment (Admin only)
 * @param {number|string} enrollmentId - Enrollment ID
 * @returns {Promise<void>}
 */
export async function adminUnenroll(enrollmentId) {
  await api.delete(ADMIN_ENDPOINTS.ENROLLMENT_DETAIL(enrollmentId));
}

/**
 * Admin mark enrollment as complete (Admin only)
 * @param {number|string} enrollmentId - Enrollment ID
 * @returns {Promise<void>}
 */
export async function adminCompleteEnrollment(enrollmentId) {
  await api.post(ADMIN_ENDPOINTS.ENROLLMENT_COMPLETE(enrollmentId));
}

/**
 * Update marks for an enrollment (Admin only)
 * @param {number|string} enrollmentId - Enrollment ID
 * @param {number} marks - Marks to assign (0-100)
 * @returns {Promise<Object>} Updated enrollment
 */
export async function updateEnrollmentMarks(enrollmentId, marks) {
  const response = await api.put(ADMIN_ENDPOINTS.ENROLLMENT_MARKS(enrollmentId), { marks });
  return response.data;
}

/**
 * Publish test result for an enrollment (Admin only)
 * Makes the result visible to the user
 * @param {number|string} enrollmentId - Enrollment ID
 * @returns {Promise<Object>} Updated enrollment
 */
export async function publishResult(enrollmentId) {
  const response = await api.post(ADMIN_ENDPOINTS.ENROLLMENT_PUBLISH_RESULT(enrollmentId));
  return response.data;
}

/**
 * Generate certificate for an enrollment based on marks (Admin only)
 * @param {number|string} enrollmentId - Enrollment ID
 * @returns {Promise<Object>} Generated certificate
 */
export async function generateCertificate(enrollmentId) {
  const response = await api.post(ADMIN_ENDPOINTS.ENROLLMENT_GENERATE_CERTIFICATE(enrollmentId));
  return response.data;
}

/**
 * Get single enrollment details (Admin only)
 * @param {number|string} enrollmentId - Enrollment ID
 * @returns {Promise<Object>} Enrollment details
 */
export async function getEnrollment(enrollmentId) {
  const response = await api.get(ADMIN_ENDPOINTS.ENROLLMENT_DETAIL(enrollmentId));
  return response.data;
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
  updateUserStatus,
  deleteUser,
  getUserEnrollments,
  adminUnenroll,
  adminCompleteEnrollment,
  updateEnrollmentMarks,
  publishResult,
  generateCertificate,
  getEnrollment,
  getAnalytics,
  getAllEnrollments,
  calculateEnrollmentStats,
};
