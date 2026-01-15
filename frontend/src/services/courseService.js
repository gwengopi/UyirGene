import api from './api';

const COURSE_ENDPOINTS = {
  LIST: '/api/courses',
  DETAIL: (id) => `/api/courses/${id}`,
  VIDEOS: (courseId) => `/api/courses/${courseId}/videos`,
  IMAGE: (courseId) => `/api/courses/${courseId}/image`,
  ENROLLED: '/api/courses/enrolled',
};

/**
 * Get all courses
 * @returns {Promise<Array>} List of all courses
 */
export async function getAllCourses() {
  const response = await api.get(COURSE_ENDPOINTS.LIST);
  return response.data;
}

/**
 * Get a single course by ID
 * @param {number|string} id - Course ID
 * @returns {Promise<Object>} Course details
 */
export async function getCourse(id) {
  const response = await api.get(COURSE_ENDPOINTS.DETAIL(id));
  return response.data;
}

/**
 * Get videos for a course (requires enrollment)
 * @param {number|string} courseId - Course ID
 * @returns {Promise<Array>} List of videos
 */
export async function getCourseVideos(courseId) {
  const response = await api.get(COURSE_ENDPOINTS.VIDEOS(courseId));
  return response.data;
}

/**
 * Get user's enrolled courses
 * @returns {Promise<Array>} List of enrolled courses
 */
export async function getEnrolledCourses() {
  const response = await api.get(COURSE_ENDPOINTS.ENROLLED);
  return response.data;
}

/**
 * Get course image URL
 * @param {number|string} courseId - Course ID
 * @returns {string} Image URL
 */
export function getCourseImageUrl(courseId) {
  return `${api.defaults.baseURL || ''}${COURSE_ENDPOINTS.IMAGE(courseId)}`;
}

/**
 * Create a new course with optional image (Admin/Instructor only)
 * @param {Object} courseData - Course data
 * @param {File} imageFile - Optional image file
 * @returns {Promise<Object>} Created course
 */
export async function createCourse(courseData, imageFile = null) {
  const { video, ...courseOnly } = courseData;

  const formData = new FormData();
  formData.append('title', courseOnly.title);
  formData.append('description', courseOnly.description);
  if (courseOnly.category) formData.append('category', courseOnly.category);
  if (courseOnly.durationHours) formData.append('durationHours', courseOnly.durationHours);
  if (courseOnly.price) formData.append('price', courseOnly.price);
  formData.append('published', courseOnly.published || false);

  if (imageFile) {
    formData.append('image', imageFile);
  }

  const response = await api.post(COURSE_ENDPOINTS.LIST, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  const createdCourse = response.data;

  // If video data provided, add video to course
  if (video && video.url) {
    try {
      await addVideoToCourse(createdCourse.id, {
        title: video.title || courseData.title,
        url: video.url,
        durationSeconds: 0,
        sequenceOrder: 1,
      });
    } catch (error) {
      console.error('Failed to add video to course:', error);
    }
  }

  return createdCourse;
}

/**
 * Update a course with optional image (Admin/Instructor only)
 * @param {number|string} id - Course ID
 * @param {Object} courseData - Updated course data
 * @param {File} imageFile - Optional image file
 * @param {boolean} removeImage - Whether to remove existing image
 * @returns {Promise<Object>} Updated course
 */
export async function updateCourse(id, courseData, imageFile = null, removeImage = false) {
  const formData = new FormData();
  formData.append('title', courseData.title);
  formData.append('description', courseData.description);
  if (courseData.category) formData.append('category', courseData.category);
  if (courseData.durationHours) formData.append('durationHours', courseData.durationHours);
  if (courseData.price) formData.append('price', courseData.price);
  formData.append('published', courseData.published || false);
  formData.append('removeImage', removeImage);

  if (imageFile) {
    formData.append('image', imageFile);
  }

  const response = await api.put(COURSE_ENDPOINTS.DETAIL(id), formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}

/**
 * Delete a course (Admin only)
 * @param {number|string} id - Course ID
 * @returns {Promise<void>}
 */
export async function deleteCourse(id) {
  await api.delete(COURSE_ENDPOINTS.DETAIL(id));
}

/**
 * Add a video to a course (Admin/Instructor only)
 * @param {number|string} courseId - Course ID
 * @param {Object} videoData - Video data
 * @returns {Promise<Object>} Created video
 */
export async function addVideoToCourse(courseId, videoData) {
  const response = await api.post(`${COURSE_ENDPOINTS.DETAIL(courseId)}/videos`, videoData);
  return response.data;
}

export default {
  getAllCourses,
  getCourse,
  getCourseVideos,
  getEnrolledCourses,
  getCourseImageUrl,
  createCourse,
  updateCourse,
  deleteCourse,
  addVideoToCourse,
};
