import api from './api';

const FAQ_ENDPOINTS = {
  ALL: '/api/faq',
  BY_CATEGORY: (category) => `/api/faq/category/${category}`,
  CATEGORIES: '/api/faq/categories',
  ADMIN_ALL: '/api/faq/admin',
  ADMIN_BY_ID: (id) => `/api/faq/admin/${id}`,
  ADMIN_CREATE: '/api/faq/admin',
  ADMIN_UPDATE: (id) => `/api/faq/admin/${id}`,
  ADMIN_DELETE: (id) => `/api/faq/admin/${id}`,
  ADMIN_SEED: '/api/faq/admin/seed',
};

// Cache for FAQs
let faqCache = null;
let faqCacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Get all FAQs grouped by category
 */
export async function getFaqs() {
  const now = Date.now();
  if (faqCache && (now - faqCacheTime) < CACHE_DURATION) {
    return faqCache;
  }

  try {
    const response = await api.get(FAQ_ENDPOINTS.ALL);
    faqCache = response.data;
    faqCacheTime = now;
    return response.data;
  } catch (error) {
    console.error('Failed to load FAQs:', error);
    return {};
  }
}

/**
 * Get FAQs by category
 */
export async function getFaqsByCategory(category) {
  const response = await api.get(FAQ_ENDPOINTS.BY_CATEGORY(category));
  return response.data;
}

/**
 * Get available categories
 */
export async function getCategories() {
  const response = await api.get(FAQ_ENDPOINTS.CATEGORIES);
  return response.data;
}

/**
 * Clear FAQ cache
 */
export function clearFaqCache() {
  faqCache = null;
  faqCacheTime = 0;
}

// ==================== Admin Functions ====================

/**
 * Get all FAQs for admin (including inactive)
 */
export async function getAllFaqsAdmin() {
  const response = await api.get(FAQ_ENDPOINTS.ADMIN_ALL);
  return response.data;
}

/**
 * Get FAQ by ID
 */
export async function getFaqById(id) {
  const response = await api.get(FAQ_ENDPOINTS.ADMIN_BY_ID(id));
  return response.data;
}

/**
 * Create a new FAQ
 */
export async function createFaq(faq) {
  const response = await api.post(FAQ_ENDPOINTS.ADMIN_CREATE, faq);
  clearFaqCache();
  return response.data;
}

/**
 * Update a FAQ
 */
export async function updateFaq(id, faq) {
  const response = await api.put(FAQ_ENDPOINTS.ADMIN_UPDATE(id), faq);
  clearFaqCache();
  return response.data;
}

/**
 * Delete a FAQ
 */
export async function deleteFaq(id) {
  await api.delete(FAQ_ENDPOINTS.ADMIN_DELETE(id));
  clearFaqCache();
}

/**
 * Seed default FAQs
 */
export async function seedFaqs() {
  const response = await api.post(FAQ_ENDPOINTS.ADMIN_SEED);
  clearFaqCache();
  return response.data;
}

export default {
  getFaqs,
  getFaqsByCategory,
  getCategories,
  clearFaqCache,
  getAllFaqsAdmin,
  getFaqById,
  createFaq,
  updateFaq,
  deleteFaq,
  seedFaqs,
};
