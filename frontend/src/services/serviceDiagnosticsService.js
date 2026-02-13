import api from './api';

const ENDPOINTS = {
  LIST: '/api/service-diagnostics',
  LIST_ADMIN: '/api/service-diagnostics/admin',
  SINGLE: (id) => `/api/service-diagnostics/${id}`,
  THUMBNAIL: (id) => `/api/service-diagnostics/${id}/thumbnail`,
  HERO_IMAGE: (id) => `/api/service-diagnostics/${id}/hero-image`,
};

/**
 * Get all published service diagnostics (public)
 */
export async function getPublishedDiagnostics() {
  const response = await api.get(ENDPOINTS.LIST);
  return response.data;
}

/**
 * Get all service diagnostics (admin)
 */
export async function getAllDiagnostics() {
  const response = await api.get(ENDPOINTS.LIST_ADMIN);
  return response.data;
}

/**
 * Get a single diagnostics by ID
 */
export async function getDiagnostics(id) {
  const response = await api.get(ENDPOINTS.SINGLE(id));
  return response.data;
}

/**
 * Create a new service diagnostics (admin)
 */
export async function createDiagnostics(data) {
  const formData = new FormData();

  formData.append('title', data.title);
  if (data.subtitle) formData.append('subtitle', data.subtitle);
  if (data.description) formData.append('description', data.description);
  if (data.testProfiles) formData.append('testProfiles', JSON.stringify(data.testProfiles));
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
 * Update a service diagnostics (admin)
 */
export async function updateDiagnostics(id, data) {
  const formData = new FormData();

  formData.append('title', data.title);
  if (data.subtitle !== undefined) formData.append('subtitle', data.subtitle || '');
  if (data.description !== undefined) formData.append('description', data.description || '');
  if (data.testProfiles) formData.append('testProfiles', JSON.stringify(data.testProfiles));
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
 * Delete a service diagnostics (admin)
 */
export async function deleteDiagnostics(id) {
  await api.delete(ENDPOINTS.SINGLE(id));
}

/**
 * Get thumbnail URL for a diagnostics
 */
export function getThumbnailUrl(id) {
  return ENDPOINTS.THUMBNAIL(id);
}

/**
 * Get hero image URL for a diagnostics
 */
export function getHeroImageUrl(id) {
  return ENDPOINTS.HERO_IMAGE(id);
}

export default {
  getPublishedDiagnostics,
  getAllDiagnostics,
  getDiagnostics,
  createDiagnostics,
  updateDiagnostics,
  deleteDiagnostics,
  getThumbnailUrl,
  getHeroImageUrl,
};
