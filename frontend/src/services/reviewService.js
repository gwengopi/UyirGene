import api from './api';

const REVIEW_ENDPOINTS = {
  PUBLIC: '/api/reviews',
  ADMIN_ALL: '/api/reviews/admin',
  FETCH_GOOGLE: '/api/reviews/fetch',
  ADMIN_CREATE: '/api/reviews/admin',
  ADMIN_UPDATE: (id) => `/api/reviews/admin/${id}`,
  ADMIN_DELETE: (id) => `/api/reviews/admin/${id}`,
};

/**
 * Get active reviews and google review link for public display
 * Returns { reviews: [...], googleReviewLink: "..." }
 */
export async function getReviews() {
  const response = await api.get(REVIEW_ENDPOINTS.PUBLIC, { cache: true, cacheTTL: 60_000 });
  return response.data;
}

/**
 * Get all reviews including inactive (admin)
 */
export async function getAllReviewsAdmin() {
  const response = await api.get(REVIEW_ENDPOINTS.ADMIN_ALL);
  return response.data;
}

/**
 * Fetch reviews from Google Places API
 */
export async function fetchFromGoogle() {
  const response = await api.post(REVIEW_ENDPOINTS.FETCH_GOOGLE);
  return response.data;
}

/**
 * Manually create a review
 */
export async function createReview(review) {
  const response = await api.post(REVIEW_ENDPOINTS.ADMIN_CREATE, review);
  return response.data;
}

/**
 * Update a review
 */
export async function updateReview(id, review) {
  const response = await api.put(REVIEW_ENDPOINTS.ADMIN_UPDATE(id), review);
  return response.data;
}

/**
 * Delete a review
 */
export async function deleteReview(id) {
  await api.delete(REVIEW_ENDPOINTS.ADMIN_DELETE(id));
}

export default {
  getReviews,
  getAllReviewsAdmin,
  fetchFromGoogle,
  createReview,
  updateReview,
  deleteReview,
};
