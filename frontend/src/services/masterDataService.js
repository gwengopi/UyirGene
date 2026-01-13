import api from './api';

const MASTER_DATA_ENDPOINTS = {
  BY_TYPE: (dataType) => `/api/master-data/type/${dataType}`,
  ALL_TYPES: '/api/master-data/types',
  CATEGORIES: '/api/master-data/categories',
  SKILL_LEVELS: '/api/master-data/skill-levels',
  ADMIN_ALL: '/api/master-data/admin',
  ADMIN_BY_TYPE: (dataType) => `/api/master-data/admin/type/${dataType}`,
  ADMIN_CREATE: '/api/master-data/admin',
  ADMIN_UPDATE: (id) => `/api/master-data/admin/${id}`,
  ADMIN_DELETE: (id) => `/api/master-data/admin/${id}`,
  ADMIN_SEED: '/api/master-data/admin/seed',
};

// Data type constants
export const DATA_TYPES = {
  COURSE_CATEGORY: 'COURSE_CATEGORY',
  SKILL_LEVEL: 'SKILL_LEVEL',
  DURATION_TYPE: 'DURATION_TYPE',
  ENROLLMENT_STATUS: 'ENROLLMENT_STATUS',
};

// Cache for master data
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Get master data by type (with caching)
 */
export async function getByType(dataType) {
  const cacheKey = `type:${dataType}`;
  const cached = cache.get(cacheKey);
  const now = Date.now();

  if (cached && (now - cached.time) < CACHE_DURATION) {
    return cached.data;
  }

  try {
    const response = await api.get(MASTER_DATA_ENDPOINTS.BY_TYPE(dataType));
    cache.set(cacheKey, { data: response.data, time: now });
    return response.data;
  } catch (error) {
    console.error(`Failed to load master data for type ${dataType}:`, error);
    return [];
  }
}

/**
 * Get course categories
 */
export async function getCourseCategories() {
  return getByType(DATA_TYPES.COURSE_CATEGORY);
}

/**
 * Get skill levels
 */
export async function getSkillLevels() {
  return getByType(DATA_TYPES.SKILL_LEVEL);
}

/**
 * Get all available data types
 */
export async function getAllTypes() {
  const response = await api.get(MASTER_DATA_ENDPOINTS.ALL_TYPES);
  return response.data;
}

/**
 * Clear cache
 */
export function clearCache() {
  cache.clear();
}

// ========== Admin functions ==========

/**
 * Get all master data (admin)
 */
export async function getAllMasterData() {
  const response = await api.get(MASTER_DATA_ENDPOINTS.ADMIN_ALL);
  return response.data;
}

/**
 * Get master data by type including inactive (admin)
 */
export async function getByTypeAdmin(dataType) {
  const response = await api.get(MASTER_DATA_ENDPOINTS.ADMIN_BY_TYPE(dataType));
  return response.data;
}

/**
 * Create a new master data entry
 */
export async function createMasterData(data) {
  const response = await api.post(MASTER_DATA_ENDPOINTS.ADMIN_CREATE, data);
  clearCache();
  return response.data;
}

/**
 * Update a master data entry
 */
export async function updateMasterData(id, data) {
  const response = await api.put(MASTER_DATA_ENDPOINTS.ADMIN_UPDATE(id), data);
  clearCache();
  return response.data;
}

/**
 * Delete a master data entry
 */
export async function deleteMasterData(id) {
  await api.delete(MASTER_DATA_ENDPOINTS.ADMIN_DELETE(id));
  clearCache();
}

/**
 * Seed default master data
 */
export async function seedDefaults() {
  const response = await api.post(MASTER_DATA_ENDPOINTS.ADMIN_SEED);
  clearCache();
  return response.data;
}

export default {
  getByType,
  getCourseCategories,
  getSkillLevels,
  getAllTypes,
  clearCache,
  getAllMasterData,
  getByTypeAdmin,
  createMasterData,
  updateMasterData,
  deleteMasterData,
  seedDefaults,
  DATA_TYPES,
};
