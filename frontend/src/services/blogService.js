import api from './api';

const BLOG_ENDPOINTS = {
  LIST: '/api/blogs',
  DETAIL: (id) => `/api/blogs/${id}`,
};

/**
 * Get all blog posts
 * @returns {Promise<Array>} List of blog posts
 */
export async function getAllBlogs() {
  const response = await api.get(BLOG_ENDPOINTS.LIST);
  return response.data;
}

/**
 * Get a single blog post by ID
 * @param {number|string} id - Blog ID
 * @returns {Promise<Object>} Blog post details
 */
export async function getBlog(id) {
  const response = await api.get(BLOG_ENDPOINTS.DETAIL(id));
  return response.data;
}

/**
 * Create a new blog post (Admin/Author only)
 * @param {Object} blogData - Blog post data
 * @param {string} blogData.title - Blog title
 * @param {string} blogData.content - Blog content
 * @param {string} blogData.category - Blog category
 * @param {string} blogData.imageUrl - Blog image URL
 * @returns {Promise<Object>} Created blog post
 */
export async function createBlog(blogData) {
  const response = await api.post(BLOG_ENDPOINTS.LIST, blogData);
  return response.data;
}

/**
 * Update a blog post (Admin/Author only)
 * @param {number|string} id - Blog ID
 * @param {Object} blogData - Updated blog data
 * @returns {Promise<Object>} Updated blog post
 */
export async function updateBlog(id, blogData) {
  const response = await api.put(BLOG_ENDPOINTS.DETAIL(id), blogData);
  return response.data;
}

/**
 * Delete a blog post (Admin only)
 * @param {number|string} id - Blog ID
 * @returns {Promise<void>}
 */
export async function deleteBlog(id) {
  await api.delete(BLOG_ENDPOINTS.DETAIL(id));
}

export default {
  getAllBlogs,
  getBlog,
  createBlog,
  updateBlog,
  deleteBlog,
};
