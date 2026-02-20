import api from './api';

const ENDPOINTS = {
  LIST: '/api/service-testings',
  LIST_ADMIN: '/api/service-testings/admin',
  SINGLE: (id) => `/api/service-testings/${id}`,
  THUMBNAIL: (id) => `/api/service-testings/${id}/thumbnail`,
  HERO_IMAGE: (id) => `/api/service-testings/${id}/hero-image`,
};

/**
 * Get all published service testings (public)
 */
export async function getPublishedTestings() {
  const response = await api.get(ENDPOINTS.LIST);
  return response.data;
}

/**
 * Get all service testings (admin)
 */
export async function getAllTestings() {
  const response = await api.get(ENDPOINTS.LIST_ADMIN);
  return response.data;
}

/**
 * Get a single testing by ID
 */
export async function getTesting(id) {
  const response = await api.get(ENDPOINTS.SINGLE(id));
  return response.data;
}

/**
 * Create a new service testing (admin)
 */
export async function createTesting(data) {
  const formData = new FormData();

  formData.append('title', data.title);
  if (data.subtitle) formData.append('subtitle', data.subtitle);
  if (data.description) formData.append('description', data.description);
  if (data.whatIs) formData.append('whatIs', data.whatIs);
  if (data.whyMatters) formData.append('whyMatters', data.whyMatters);
  if (data.certificate) formData.append('certificate', data.certificate);
  if (data.testingServices) formData.append('testingServices', JSON.stringify(data.testingServices));
  if (data.highlights) formData.append('highlights', JSON.stringify(data.highlights));
  formData.append('published', data.published || false);
  formData.append('displayOrder', data.displayOrder || 0);
  if (data.thumbnailImage) formData.append('thumbnailImage', data.thumbnailImage);
  if (data.heroImage) formData.append('heroImage', data.heroImage);

  const response = await api.post(ENDPOINTS.LIST, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

/**
 * Update a service testing (admin)
 */
export async function updateTesting(id, data) {
  const formData = new FormData();

  formData.append('title', data.title);
  if (data.subtitle !== undefined) formData.append('subtitle', data.subtitle || '');
  if (data.description !== undefined) formData.append('description', data.description || '');
  if (data.whatIs !== undefined) formData.append('whatIs', data.whatIs || '');
  if (data.whyMatters !== undefined) formData.append('whyMatters', data.whyMatters || '');
  if (data.certificate !== undefined) formData.append('certificate', data.certificate || '');
  if (data.testingServices) formData.append('testingServices', JSON.stringify(data.testingServices));
  if (data.highlights) formData.append('highlights', JSON.stringify(data.highlights));
  formData.append('published', data.published || false);
  formData.append('displayOrder', data.displayOrder || 0);
  if (data.thumbnailImage) formData.append('thumbnailImage', data.thumbnailImage);
  if (data.heroImage) formData.append('heroImage', data.heroImage);
  if (data.removeThumbnail) formData.append('removeThumbnail', true);
  if (data.removeHeroImage) formData.append('removeHeroImage', true);

  const response = await api.put(ENDPOINTS.SINGLE(id), formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

/**
 * Delete a service testing (admin)
 */
export async function deleteTesting(id) {
  await api.delete(ENDPOINTS.SINGLE(id));
}

/**
 * Get thumbnail URL for a testing
 */
export function getThumbnailUrl(id) {
  return ENDPOINTS.THUMBNAIL(id);
}

/**
 * Get hero image URL for a testing
 */
export function getHeroImageUrl(id) {
  return ENDPOINTS.HERO_IMAGE(id);
}

export default {
  getPublishedTestings,
  getAllTestings,
  getTesting,
  createTesting,
  updateTesting,
  deleteTesting,
  getThumbnailUrl,
  getHeroImageUrl,
};
