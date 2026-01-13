import api from './api';

const COURSE_ENDPOINTS = {
  LIST: '/api/courses',
  DETAIL: (id) => `/api/courses/${id}`,
  VIDEOS: (courseId) => `/api/courses/${courseId}/videos`,
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
 * Create a new course (Admin/Instructor only)
 * @param {Object} courseData - Course data
 * @param {string} courseData.title - Course title
 * @param {string} courseData.description - Course description
 * @param {string} courseData.category - Course category
 * @param {number} courseData.durationHours - Duration in hours
 * @param {number} courseData.price - Course price (null/0 for free)
 * @param {boolean} courseData.published - Whether course is published
 * @param {Object} courseData.video - Optional video to add
 * @returns {Promise<Object>} Created course
 */
export async function createCourse(courseData) {
  const { video, ...courseOnly } = courseData;

  // Create course first
  const response = await api.post(COURSE_ENDPOINTS.LIST, courseOnly);
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
 * Update a course (Admin/Instructor only)
 * @param {number|string} id - Course ID
 * @param {Object} courseData - Updated course data
 * @returns {Promise<Object>} Updated course
 */
export async function updateCourse(id, courseData) {
  const response = await api.put(COURSE_ENDPOINTS.DETAIL(id), courseData);
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
  createCourse,
  updateCourse,
  deleteCourse,
  addVideoToCourse,
};
