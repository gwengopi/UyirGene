import api from './api';

const ENDPOINTS = {
  LIST: '/api/service-certifications',
  LIST_ADMIN: '/api/service-certifications/admin',
  SINGLE: (id) => `/api/service-certifications/${id}`,
  BY_SLUG: (slug) => `/api/service-certifications/slug/${slug}`,
  THUMBNAIL: (id) => `/api/service-certifications/${id}/thumbnail`,
  HERO_IMAGE: (id) => `/api/service-certifications/${id}/hero-image`,
};

/**
 * Get all published service certifications (public)
 */
export async function getPublishedCertifications() {
  const response = await api.get(ENDPOINTS.LIST);
  return response.data;
}

/**
 * Get all service certifications (admin)
 */
export async function getAllCertifications() {
  const response = await api.get(ENDPOINTS.LIST_ADMIN);
  return response.data;
}

/**
 * Get a single certification by ID
 */
export async function getCertification(id) {
  const response = await api.get(ENDPOINTS.SINGLE(id));
  return response.data;
}

/**
 * Get a single certification by slug
 */
export async function getCertificationBySlug(slug) {
  const response = await api.get(ENDPOINTS.BY_SLUG(slug));
  return response.data;
}

/**
 * Create a new service certification (admin)
 */
export async function createCertification(data) {
  const formData = new FormData();

  formData.append('title', data.title);
  if (data.subtitle) formData.append('subtitle', data.subtitle);
  if (data.description) formData.append('description', data.description);
  if (data.whatIs) formData.append('whatIs', data.whatIs);
  if (data.keyElements) formData.append('keyElements', JSON.stringify(data.keyElements));
  if (data.whoNeeds) formData.append('whoNeeds', JSON.stringify(data.whoNeeds));
  if (data.certificationRoute) formData.append('certificationRoute', JSON.stringify(data.certificationRoute));
  if (data.benefits) formData.append('benefits', JSON.stringify(data.benefits));
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
 * Update a service certification (admin)
 */
export async function updateCertification(id, data) {
  const formData = new FormData();

  formData.append('title', data.title);
  if (data.subtitle !== undefined) formData.append('subtitle', data.subtitle || '');
  if (data.description !== undefined) formData.append('description', data.description || '');
  if (data.whatIs !== undefined) formData.append('whatIs', data.whatIs || '');
  if (data.keyElements) formData.append('keyElements', JSON.stringify(data.keyElements));
  if (data.whoNeeds) formData.append('whoNeeds', JSON.stringify(data.whoNeeds));
  if (data.certificationRoute) formData.append('certificationRoute', JSON.stringify(data.certificationRoute));
  if (data.benefits) formData.append('benefits', JSON.stringify(data.benefits));
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
 * Delete a service certification (admin)
 */
export async function deleteCertification(id) {
  await api.delete(ENDPOINTS.SINGLE(id));
}

/**
 * Get thumbnail URL for a certification
 */
export function getThumbnailUrl(id) {
  return ENDPOINTS.THUMBNAIL(id);
}

/**
 * Get hero image URL for a certification
 */
export function getHeroImageUrl(id) {
  return ENDPOINTS.HERO_IMAGE(id);
}

export default {
  getPublishedCertifications,
  getAllCertifications,
  getCertification,
  getCertificationBySlug,
  createCertification,
  updateCertification,
  deleteCertification,
  getThumbnailUrl,
  getHeroImageUrl,
};
