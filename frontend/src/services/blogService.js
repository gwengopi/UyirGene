import api from './api';

const BLOG_ENDPOINTS = {
  // Public endpoints
  LIST: '/api/blogs',
  LIST_ALL: '/api/blogs/all',
  DETAIL: (id) => `/api/blogs/${id}`,
  SLUG: (slug) => `/api/blogs/slug/${slug}`,
  CATEGORY: (category) => `/api/blogs/category/${category}`,
  SEARCH: '/api/blogs/search',
  RECENT: '/api/blogs/recent',
  CATEGORIES: '/api/blogs/categories',
  IMAGE: (id) => `/api/blogs/${id}/image`,
  SUBSCRIBE: '/api/blogs/subscribe',
  UNSUBSCRIBE: (token) => `/api/blogs/unsubscribe/${token}`,
  SUBSCRIBER_COUNT: '/api/blogs/subscribers/count',

  // Admin endpoints
  ADMIN_LIST: '/api/blogs/admin/all',
  ADMIN_DETAIL: (id) => `/api/blogs/admin/${id}`,
  ADMIN_CREATE: '/api/blogs/admin',
  ADMIN_UPDATE: (id) => `/api/blogs/admin/${id}`,
  ADMIN_DELETE: (id) => `/api/blogs/admin/${id}`,
  ADMIN_STATUS: (id) => `/api/blogs/admin/${id}/status`,
  ADMIN_IMAGE: (id) => `/api/blogs/admin/${id}/image`,
  ADMIN_SUBSCRIBERS: '/api/blogs/admin/subscribers',
};

// ==================== PUBLIC METHODS ====================

/**
 * Get published blogs with pagination
 * @param {number} page - Page number (0-indexed)
 * @param {number} size - Page size
 * @returns {Promise<Object>} Paginated blog list
 */
export async function getPublishedBlogs(page = 0, size = 10) {
  const response = await api.get(BLOG_ENDPOINTS.LIST, { params: { page, size } });
  return response.data;
}

/**
 * Get all published blogs (no pagination)
 * @returns {Promise<Array>} List of published blogs
 */
export async function getAllBlogs() {
  const response = await api.get(BLOG_ENDPOINTS.LIST_ALL);
  return response.data;
}

/**
 * Get blog by ID (public - published only)
 * @param {number|string} id - Blog ID
 * @returns {Promise<Object>} Blog post details
 */
export async function getBlog(id) {
  const response = await api.get(BLOG_ENDPOINTS.DETAIL(id));
  return response.data;
}

/**
 * Get blog by URL slug
 * @param {string} slug - URL slug
 * @returns {Promise<Object>} Blog post details
 */
export async function getBlogBySlug(slug) {
  const response = await api.get(BLOG_ENDPOINTS.SLUG(slug));
  return response.data;
}

/**
 * Get blogs by category
 * @param {string} category - Category name
 * @returns {Promise<Array>} List of blogs in category
 */
export async function getBlogsByCategory(category) {
  const response = await api.get(BLOG_ENDPOINTS.CATEGORY(category));
  return response.data;
}

/**
 * Search blogs
 * @param {string} query - Search query
 * @returns {Promise<Array>} Search results
 */
export async function searchBlogs(query) {
  const response = await api.get(BLOG_ENDPOINTS.SEARCH, { params: { q: query } });
  return response.data;
}

/**
 * Get recent blogs
 * @returns {Promise<Array>} List of recent blogs
 */
export async function getRecentBlogs() {
  const response = await api.get(BLOG_ENDPOINTS.RECENT);
  return response.data;
}

/**
 * Get categories with count
 * @returns {Promise<Array>} List of categories with counts
 */
export async function getCategoriesWithCount() {
  const response = await api.get(BLOG_ENDPOINTS.CATEGORIES);
  return response.data;
}

/**
 * Get blog featured image URL
 * @param {number|string} id - Blog ID
 * @returns {string} Image URL
 */
export function getBlogImageUrl(id) {
  return `${api.defaults.baseURL || ''}${BLOG_ENDPOINTS.IMAGE(id)}`;
}

// ==================== SUBSCRIPTION METHODS ====================

/**
 * Subscribe to blog newsletter
 * @param {string} email - Email address
 * @param {string} name - Subscriber name
 * @returns {Promise<Object>} Subscription result
 */
export async function subscribe(email, name) {
  const response = await api.post(BLOG_ENDPOINTS.SUBSCRIBE, { email, name });
  return response.data;
}

/**
 * Unsubscribe from blog newsletter
 * @param {string} token - Unsubscribe token
 * @returns {Promise<Object>} Unsubscribe result
 */
export async function unsubscribe(token) {
  const response = await api.get(BLOG_ENDPOINTS.UNSUBSCRIBE(token));
  return response.data;
}

/**
 * Get subscriber count
 * @returns {Promise<Object>} Subscriber count
 */
export async function getSubscriberCount() {
  const response = await api.get(BLOG_ENDPOINTS.SUBSCRIBER_COUNT);
  return response.data;
}

// ==================== ADMIN METHODS ====================

/**
 * Get all blogs (admin)
 * @returns {Promise<Array>} List of all blogs
 */
export async function getAdminBlogs() {
  const response = await api.get(BLOG_ENDPOINTS.ADMIN_LIST);
  return response.data;
}

/**
 * Get blog by ID (admin - any status)
 * @param {number|string} id - Blog ID
 * @returns {Promise<Object>} Blog post details
 */
export async function getAdminBlog(id) {
  const response = await api.get(BLOG_ENDPOINTS.ADMIN_DETAIL(id));
  return response.data;
}

/**
 * Create a new blog post (Admin/Author only)
 * @param {Object} blogData - Blog post data
 * @returns {Promise<Object>} Created blog post
 */
export async function createBlog(blogData) {
  const response = await api.post(BLOG_ENDPOINTS.ADMIN_CREATE, blogData);
  return response.data;
}

/**
 * Update a blog post (Admin/Author only)
 * @param {number|string} id - Blog ID
 * @param {Object} blogData - Updated blog data
 * @returns {Promise<Object>} Updated blog post
 */
export async function updateBlog(id, blogData) {
  const response = await api.put(BLOG_ENDPOINTS.ADMIN_UPDATE(id), blogData);
  return response.data;
}

/**
 * Delete a blog post (Admin only)
 * @param {number|string} id - Blog ID
 * @returns {Promise<void>}
 */
export async function deleteBlog(id) {
  await api.delete(BLOG_ENDPOINTS.ADMIN_DELETE(id));
}

/**
 * Update blog status
 * @param {number|string} id - Blog ID
 * @param {string} status - New status (DRAFT, PUBLISHED, SCHEDULED, ARCHIVED)
 * @returns {Promise<Object>} Updated blog
 */
export async function updateBlogStatus(id, status) {
  const response = await api.patch(BLOG_ENDPOINTS.ADMIN_STATUS(id), { status });
  return response.data;
}

/**
 * Upload featured image
 * @param {number|string} id - Blog ID
 * @param {File} file - Image file
 * @returns {Promise<Object>} Updated blog
 */
export async function uploadFeaturedImage(id, file) {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post(BLOG_ENDPOINTS.ADMIN_IMAGE(id), formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

/**
 * Get admin blog image URL
 * @param {number|string} id - Blog ID
 * @returns {string} Image URL
 */
export function getAdminBlogImageUrl(id) {
  return `${api.defaults.baseURL || ''}${BLOG_ENDPOINTS.ADMIN_IMAGE(id)}`;
}

/**
 * Get all active subscribers (admin)
 * @returns {Promise<Array>} List of active subscribers
 */
export async function getActiveSubscribers() {
  const response = await api.get(BLOG_ENDPOINTS.ADMIN_SUBSCRIBERS);
  return response.data;
}

export default {
  // Public
  getPublishedBlogs,
  getAllBlogs,
  getBlog,
  getBlogBySlug,
  getBlogsByCategory,
  searchBlogs,
  getRecentBlogs,
  getCategoriesWithCount,
  getBlogImageUrl,
  // Subscription
  subscribe,
  unsubscribe,
  getSubscriberCount,
  // Admin
  getAdminBlogs,
  getAdminBlog,
  createBlog,
  updateBlog,
  deleteBlog,
  updateBlogStatus,
  uploadFeaturedImage,
  getAdminBlogImageUrl,
  getActiveSubscribers,
};
