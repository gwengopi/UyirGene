import api from './api';

const BUNDLE_ENDPOINTS = {
  LIST: '/api/bundles',
  BY_COURSE: (courseId) => `/api/bundles/by-course/${courseId}`,
  BY_COURSE_CATEGORY: '/api/bundles/by-course-category',
  DETAIL: (id) => `/api/bundles/${id}`,
  BY_SLUG: (slug) => `/api/bundles/slug/${slug}`,
  ENROLL: (id) => `/api/bundles/${id}/enroll`,
  CONFIRM: (id) => `/api/bundles/${id}/enroll/confirm`,
  MULTI_ENROLL: '/api/bundles/enroll/multi',
  MULTI_CONFIRM: '/api/bundles/enroll/multi/confirm',
  GUEST_MULTI_ENROLL: '/api/guest/bundles/enroll/multi',
  GUEST_MULTI_CONFIRM: '/api/guest/bundles/enroll/multi/confirm',
  ADMIN_LIST: '/api/bundles/admin',
  ADMIN_CREATE: '/api/bundles/admin',
  ADMIN_UPDATE: (id) => `/api/bundles/admin/${id}`,
  ADMIN_DELETE: (id) => `/api/bundles/admin/${id}`,
  ADMIN_PUBLISH: (id) => `/api/bundles/admin/${id}/publish`,
};

// ==================== Public ====================

export async function getBundlesByCourse(courseId) {
  const response = await api.get(BUNDLE_ENDPOINTS.BY_COURSE(courseId), { cache: true, cacheTTL: 60_000 });
  return response.data;
}

export async function getBundlesByCourseCategory(category) {
  const response = await api.get(BUNDLE_ENDPOINTS.BY_COURSE_CATEGORY, { params: { category }, cache: true, cacheTTL: 60_000 });
  return response.data;
}

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

export async function getBundleBySlug(slug) {
  const response = await api.get(BUNDLE_ENDPOINTS.BY_SLUG(slug));
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

export async function startMultiBundleEnrollment(bundleIds, countryCode, courseId) {
  const body = { bundleIds, countryCode };
  if (courseId) body.courseId = Number(courseId);
  const response = await api.post(BUNDLE_ENDPOINTS.MULTI_ENROLL, body);
  return response.data;
}

export async function confirmMultiBundlePayment(bundleIds, paymentData, courseId) {
  const body = { bundleIds, ...paymentData };
  if (courseId) body.courseId = Number(courseId);
  const response = await api.post(BUNDLE_ENDPOINTS.MULTI_CONFIRM, body);
  return response.data;
}

export async function startGuestMultiBundleEnrollment(bundleIds, guestInfo, countryCode, courseId) {
  const body = { bundleIds, ...guestInfo, countryCode };
  if (courseId) body.standaloneCourseId = Number(courseId);
  const response = await api.post(BUNDLE_ENDPOINTS.GUEST_MULTI_ENROLL, body);
  return response.data;
}

export async function confirmGuestMultiBundlePayment(bundleIds, paymentData, email, courseId) {
  const body = { bundleIds, email, ...paymentData };
  if (courseId) body.standaloneCourseId = Number(courseId);
  const response = await api.post(BUNDLE_ENDPOINTS.GUEST_MULTI_CONFIRM, body);
  return response.data;
}

export async function startAnonMultiBundleEnrollment(bundleIds, countryCode, courseId) {
  const body = { bundleIds, countryCode };
  if (courseId) body.standaloneCourseId = Number(courseId);
  const response = await api.post('/api/guest/bundles/anon-enroll', body);
  return response.data;
}

export async function confirmAnonMultiBundlePayment(bundleIds, paymentData, courseId) {
  const body = { bundleIds, ...paymentData };
  if (courseId) body.standaloneCourseId = Number(courseId);
  const response = await api.post('/api/guest/bundles/anon-confirm', body);
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
  getBundlesByCourse,
  getBundleById,
  getBundleBySlug,
  startBundleEnrollment,
  confirmBundlePayment,
  startMultiBundleEnrollment,
  confirmMultiBundlePayment,
  getAllBundles,
  createBundle,
  updateBundle,
  deleteBundle,
  togglePublish,
};
