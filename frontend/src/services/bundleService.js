import api from './api';

const BUNDLE_ENDPOINTS = {
  LIST: '/api/bundles',
  DETAIL: (id) => `/api/bundles/${id}`,
  ENROLL: (id) => `/api/bundles/${id}/enroll`,
  CONFIRM: (id) => `/api/bundles/${id}/enroll/confirm`,
  ADMIN_LIST: '/api/bundles/admin',
  ADMIN_CREATE: '/api/bundles/admin',
  ADMIN_UPDATE: (id) => `/api/bundles/admin/${id}`,
  ADMIN_DELETE: (id) => `/api/bundles/admin/${id}`,
  ADMIN_PUBLISH: (id) => `/api/bundles/admin/${id}/publish`,
};

// ==================== Public ====================

export async function getPublishedBundles() {
  const response = await api.get(BUNDLE_ENDPOINTS.LIST);
  return response.data;
}

export async function getPublishedBundlesByCategory(category) {
  const response = await api.get(BUNDLE_ENDPOINTS.LIST, { params: { category } });
  return response.data;
}

export async function getBundleById(id) {
  const response = await api.get(BUNDLE_ENDPOINTS.DETAIL(id));
  return response.data;
}

// ==================== Enrollment ====================

export async function startBundleEnrollment(bundleId, countryCode) {
  const body = countryCode ? { countryCode } : {};
  const response = await api.post(BUNDLE_ENDPOINTS.ENROLL(bundleId), body);
  return response.data;
}

export async function confirmBundlePayment(bundleId, paymentData) {
  const response = await api.post(BUNDLE_ENDPOINTS.CONFIRM(bundleId), paymentData);
  return response.data;
}

// ==================== Admin ====================

export async function getAllBundles() {
  const response = await api.get(BUNDLE_ENDPOINTS.ADMIN_LIST);
  return response.data;
}

export async function createBundle(data, imageFile) {
  const formData = new FormData();
  formData.append('bundleCode', data.bundleCode);
  formData.append('title', data.title);
  if (data.description) formData.append('description', data.description);
  formData.append('price', data.price);
  if (data.displayOrder != null) formData.append('displayOrder', data.displayOrder);
  if (data.category) formData.append('category', data.category);
  formData.append('courseIds', JSON.stringify(data.courseIds));
  if (data.countryPrices?.length) {
    formData.append('countryPrices', JSON.stringify(data.countryPrices));
  }
  if (imageFile) formData.append('thumbnailImage', imageFile);

  const response = await api.post(BUNDLE_ENDPOINTS.ADMIN_CREATE, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

export async function updateBundle(id, data, imageFile) {
  const formData = new FormData();
  formData.append('bundleCode', data.bundleCode);
  formData.append('title', data.title);
  if (data.description) formData.append('description', data.description);
  formData.append('price', data.price);
  if (data.displayOrder != null) formData.append('displayOrder', data.displayOrder);
  if (data.category) formData.append('category', data.category);
  formData.append('courseIds', JSON.stringify(data.courseIds));
  if (data.countryPrices?.length) {
    formData.append('countryPrices', JSON.stringify(data.countryPrices));
  }
  if (data.removeThumbnailImage) formData.append('removeThumbnailImage', 'true');
  if (imageFile) formData.append('thumbnailImage', imageFile);

  const response = await api.put(BUNDLE_ENDPOINTS.ADMIN_UPDATE(id), formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

export async function deleteBundle(id) {
  await api.delete(BUNDLE_ENDPOINTS.ADMIN_DELETE(id));
}

export async function togglePublish(id) {
  const response = await api.patch(BUNDLE_ENDPOINTS.ADMIN_PUBLISH(id));
  return response.data;
}

export default {
  getPublishedBundles,
  getBundleById,
  startBundleEnrollment,
  confirmBundlePayment,
  getAllBundles,
  createBundle,
  updateBundle,
  deleteBundle,
  togglePublish,
};
