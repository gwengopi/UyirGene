import api from './api';

const ENDPOINTS = {
  LIST: '/api/careers',
  LIST_ADMIN: '/api/careers/admin',
  SINGLE: (id) => `/api/careers/${id}`,
};

/**
 * Get all published careers (public)
 */
export async function getPublishedCareers() {
  const response = await api.get(ENDPOINTS.LIST);
  return response.data;
}

/**
 * Get all careers (admin)
 */
export async function getAllCareers() {
  const response = await api.get(ENDPOINTS.LIST_ADMIN);
  return response.data;
}

/**
 * Get a single career by ID
 */
export async function getCareer(id) {
  const response = await api.get(ENDPOINTS.SINGLE(id));
  return response.data;
}

/**
 * Create a new career entry (admin)
 */
export async function createCareer(data) {
  const formData = new FormData();

  formData.append('title', data.title);
  if (data.subtitle) formData.append('subtitle', data.subtitle);
  if (data.whyJoinTitle) formData.append('whyJoinTitle', data.whyJoinTitle);
  if (data.whyJoinDescription) formData.append('whyJoinDescription', data.whyJoinDescription);
  if (data.benefits) formData.append('benefits', JSON.stringify(data.benefits));
  if (data.positions) formData.append('positions', JSON.stringify(data.positions));
  formData.append('published', data.published || false);
  formData.append('displayOrder', data.displayOrder || 0);

  const response = await api.post(ENDPOINTS.LIST, formData);
  return response.data;
}

/**
 * Update a career entry (admin)
 */
export async function updateCareer(id, data) {
  const formData = new FormData();

  formData.append('title', data.title);
  if (data.subtitle !== undefined) formData.append('subtitle', data.subtitle || '');
  if (data.whyJoinTitle !== undefined) formData.append('whyJoinTitle', data.whyJoinTitle || '');
  if (data.whyJoinDescription !== undefined) formData.append('whyJoinDescription', data.whyJoinDescription || '');
  if (data.benefits) formData.append('benefits', JSON.stringify(data.benefits));
  if (data.positions) formData.append('positions', JSON.stringify(data.positions));
  formData.append('published', data.published || false);
  formData.append('displayOrder', data.displayOrder || 0);

  const response = await api.put(ENDPOINTS.SINGLE(id), formData);
  return response.data;
}

/**
 * Delete a career entry (admin)
 */
export async function deleteCareer(id) {
  await api.delete(ENDPOINTS.SINGLE(id));
}

export default {
  getPublishedCareers,
  getAllCareers,
  getCareer,
  createCareer,
  updateCareer,
  deleteCareer,
};
