import api from './api';

const CONFIG_ENDPOINTS = {
  IMAGES: '/api/config/images',
  BY_CATEGORY: (category) => `/api/config/category/${category}`,
  BY_KEY: (key) => `/api/config/key/${key}`,
  ADMIN_ALL: '/api/config/admin',
  ADMIN_CREATE: '/api/config/admin',
  ADMIN_UPDATE: (id) => `/api/config/admin/${id}`,
  ADMIN_DELETE: (id) => `/api/config/admin/${id}`,
  ADMIN_SEED: '/api/config/admin/seed',
  ADMIN_UPLOAD_IMAGE: (id) => `/api/config/admin/${id}/image`,
};

// Cache for images
let imageCache = null;
let imageCacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Get all image configurations
 */
export async function getImages() {
  const now = Date.now();
  if (imageCache && (now - imageCacheTime) < CACHE_DURATION) {
    return imageCache;
  }

  try {
    const response = await api.get(CONFIG_ENDPOINTS.IMAGES);
    imageCache = response.data;
    imageCacheTime = now;
    return response.data;
  } catch (error) {
    console.error('Failed to load images from config:', error);
    return {};
  }
}

/**
 * Get configuration by category
 */
export async function getByCategory(category) {
  const response = await api.get(CONFIG_ENDPOINTS.BY_CATEGORY(category));
  return response.data;
}

/**
 * Get configuration value by key
 */
export async function getByKey(key) {
  const response = await api.get(CONFIG_ENDPOINTS.BY_KEY(key));
  return response.data;
}

/**
 * Clear image cache (call after updates)
 */
export function clearImageCache() {
  imageCache = null;
  imageCacheTime = 0;
}

// ========== Admin functions ==========

/**
 * Get all configurations (admin)
 */
export async function getAllConfigs() {
  const response = await api.get(CONFIG_ENDPOINTS.ADMIN_ALL);
  return response.data;
}

/**
 * Create a new configuration
 */
export async function createConfig(config) {
  const response = await api.post(CONFIG_ENDPOINTS.ADMIN_CREATE, config);
  clearImageCache();
  return response.data;
}

/**
 * Update a configuration
 */
export async function updateConfig(id, config) {
  const response = await api.put(CONFIG_ENDPOINTS.ADMIN_UPDATE(id), config);
  clearImageCache();
  return response.data;
}

/**
 * Delete a configuration
 */
export async function deleteConfig(id) {
  await api.delete(CONFIG_ENDPOINTS.ADMIN_DELETE(id));
  clearImageCache();
}

/**
 * Upload an image file for an existing configuration.
 * The backend stores the bytes and sets value to the serve URL automatically.
 */
export async function uploadConfigImage(id, file) {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post(CONFIG_ENDPOINTS.ADMIN_UPLOAD_IMAGE(id), formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  clearImageCache();
  return response.data;
}

/**
 * Seed default configurations
 */
export async function seedDefaults() {
  const response = await api.post(CONFIG_ENDPOINTS.ADMIN_SEED);
  clearImageCache();
  return response.data;
}

export default {
  getImages,
  getByCategory,
  getByKey,
  clearImageCache,
  getAllConfigs,
  createConfig,
  updateConfig,
  deleteConfig,
  uploadConfigImage,
  seedDefaults,
};
