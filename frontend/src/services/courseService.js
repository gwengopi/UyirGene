import api from './api';

const COURSE_ENDPOINTS = {
  LIST: '/api/courses',
  DETAIL: (id) => `/api/courses/${id}`,
  VIDEOS: (courseId) => `/api/courses/${courseId}/videos`,
  VIDEOS_ADMIN: (courseId) => `/api/courses/${courseId}/videos/admin`,
  VIDEO: (courseId, videoId) => `/api/courses/${courseId}/videos/${videoId}`,
  IMAGE: (courseId) => `/api/courses/${courseId}/image`,
  THUMBNAIL: (courseId) => `/api/courses/${courseId}/thumbnail`,
  DESCRIPTION_IMAGE: (courseId) => `/api/courses/${courseId}/description-image`,
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
 * Create a new course with optional images (Admin/Instructor only)
 * @param {Object} courseData - Course data including videos array
 * @param {Object} imageOptions - Image options { thumbnailImage, descriptionImage }
 * @returns {Promise<Object>} Created course
 */
export async function createCourse(courseData, imageOptions = {}) {
  const { videos, ...courseOnly } = courseData;

  const formData = new FormData();
  formData.append('title', courseOnly.title);
  if (courseOnly.courseCode) formData.append('courseCode', courseOnly.courseCode);
  if (courseOnly.trainerName) formData.append('trainerName', courseOnly.trainerName);
  if (courseOnly.shortDescription) formData.append('shortDescription', courseOnly.shortDescription);
  formData.append('description', courseOnly.description);
  if (courseOnly.category) formData.append('category', courseOnly.category);
  if (courseOnly.durationHours) formData.append('durationHours', courseOnly.durationHours);
  if (courseOnly.price) formData.append('price', courseOnly.price);
  formData.append('published', courseOnly.published || false);
  if (courseOnly.testLink) formData.append('testLink', courseOnly.testLink);
  if (courseOnly.testDescription) formData.append('testDescription', courseOnly.testDescription);

  // Handle images
  if (imageOptions.thumbnailImage) {
    formData.append('thumbnailImage', imageOptions.thumbnailImage);
  }
  if (imageOptions.descriptionImage) {
    formData.append('descriptionImage', imageOptions.descriptionImage);
  }

  const response = await api.post(COURSE_ENDPOINTS.LIST, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  const createdCourse = response.data;

  // If videos provided, add them to the course
  if (videos && videos.length > 0) {
    for (const video of videos) {
      if (video.url) {
        try {
          await addVideoToCourse(createdCourse.id, {
            title: video.title || courseData.title,
            url: video.url,
            orderIndex: video.orderIndex || 0,
            durationSeconds: 0,
          });
        } catch (error) {
          console.error('Failed to add video to course:', error);
        }
      }
    }
  }

  return createdCourse;
}

/**
 * Update a course with optional images (Admin/Instructor only)
 * @param {number|string} id - Course ID
 * @param {Object} courseData - Updated course data including videos array
 * @param {Object} imageOptions - Image options { thumbnailImage, descriptionImage, removeThumbnailImage, removeDescriptionImage }
 * @returns {Promise<Object>} Updated course
 */
export async function updateCourse(id, courseData, imageOptions = {}) {
  const { videos, ...courseOnly } = courseData;

  const formData = new FormData();
  formData.append('title', courseOnly.title);
  if (courseOnly.courseCode !== undefined) formData.append('courseCode', courseOnly.courseCode || '');
  if (courseOnly.trainerName !== undefined) formData.append('trainerName', courseOnly.trainerName || '');
  if (courseOnly.shortDescription !== undefined) formData.append('shortDescription', courseOnly.shortDescription || '');
  formData.append('description', courseOnly.description);
  if (courseOnly.category) formData.append('category', courseOnly.category);
  if (courseOnly.durationHours) formData.append('durationHours', courseOnly.durationHours);
  if (courseOnly.price) formData.append('price', courseOnly.price);
  formData.append('published', courseOnly.published || false);
  if (courseOnly.testLink !== undefined) formData.append('testLink', courseOnly.testLink || '');
  if (courseOnly.testDescription !== undefined) formData.append('testDescription', courseOnly.testDescription || '');

  // Handle images
  if (imageOptions.thumbnailImage) {
    formData.append('thumbnailImage', imageOptions.thumbnailImage);
  }
  if (imageOptions.descriptionImage) {
    formData.append('descriptionImage', imageOptions.descriptionImage);
  }
  formData.append('removeThumbnailImage', imageOptions.removeThumbnailImage || false);
  formData.append('removeDescriptionImage', imageOptions.removeDescriptionImage || false);

  const response = await api.put(COURSE_ENDPOINTS.DETAIL(id), formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  // Handle videos - update existing, add new, delete removed
  if (videos) {
    // Get existing videos
    const existingVideos = await getAdminCourseVideos(id);
    const existingVideoIds = existingVideos.map(v => v.id);
    const newVideoIds = videos.filter(v => v.id).map(v => v.id);

    // Delete videos that are no longer in the list
    for (const existingVideo of existingVideos) {
      if (!newVideoIds.includes(existingVideo.id)) {
        try {
          await deleteVideo(id, existingVideo.id);
        } catch (error) {
          console.error('Failed to delete video:', error);
        }
      }
    }

    // Update existing videos and add new ones
    for (const video of videos) {
      if (video.url) {
        if (video.id && existingVideoIds.includes(video.id)) {
          // Update existing video
          try {
            await updateVideo(id, video.id, {
              title: video.title || courseOnly.title,
              url: video.url,
              orderIndex: video.orderIndex || 0,
            });
          } catch (error) {
            console.error('Failed to update video:', error);
          }
        } else if (!video.id) {
          // Add new video
          try {
            await addVideoToCourse(id, {
              title: video.title || courseOnly.title,
              url: video.url,
              orderIndex: video.orderIndex || 0,
              durationSeconds: 0,
            });
          } catch (error) {
            console.error('Failed to add video:', error);
          }
        }
      }
    }
  }

  return response.data;
}

/**
 * Get admin videos for a course (includes all videos)
 * @param {number|string} courseId - Course ID
 * @returns {Promise<Array>} List of videos
 */
export async function getAdminCourseVideos(courseId) {
  try {
    const response = await api.get(COURSE_ENDPOINTS.VIDEOS_ADMIN(courseId));
    return response.data;
  } catch (error) {
    return [];
  }
}

/**
 * Update a video
 * @param {number|string} courseId - Course ID
 * @param {number|string} videoId - Video ID
 * @param {Object} videoData - Video data
 * @returns {Promise<Object>} Updated video
 */
export async function updateVideo(courseId, videoId, videoData) {
  const response = await api.put(COURSE_ENDPOINTS.VIDEO(courseId, videoId), videoData);
  return response.data;
}

/**
 * Delete a video
 * @param {number|string} courseId - Course ID
 * @param {number|string} videoId - Video ID
 * @returns {Promise<void>}
 */
export async function deleteVideo(courseId, videoId) {
  await api.delete(COURSE_ENDPOINTS.VIDEO(courseId, videoId));
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
  getAdminCourseVideos,
  getEnrolledCourses,
  getCourseImageUrl,
  createCourse,
  updateCourse,
  deleteCourse,
  addVideoToCourse,
  updateVideo,
  deleteVideo,
};
