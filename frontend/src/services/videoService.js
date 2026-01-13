import api from './api';

const VIDEO_ENDPOINTS = {
  PROGRESS: (videoId) => `/api/videos/${videoId}/progress`,
};

/**
 * Update video progress
 * @param {number|string} videoId - Video ID
 * @param {number} lastPositionSeconds - Last watched position in seconds
 * @returns {Promise<Object>} Updated progress object
 */
export async function updateProgress(videoId, lastPositionSeconds) {
  const response = await api.post(VIDEO_ENDPOINTS.PROGRESS(videoId), {
    lastPositionSeconds,
  });
  return response.data;
}

/**
 * Get video progress for current user
 * @param {number|string} videoId - Video ID
 * @returns {Promise<Object|null>} Progress object or null if not found
 */
export async function getProgress(videoId) {
  try {
    const response = await api.get(VIDEO_ENDPOINTS.PROGRESS(videoId));
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      return null;
    }
    throw error;
  }
}

/**
 * Get progress for multiple videos
 * @param {Array<number|string>} videoIds - Array of video IDs
 * @returns {Promise<Object>} Map of videoId -> progress
 */
export async function getMultipleProgress(videoIds) {
  const progressMap = {};

  await Promise.all(
    videoIds.map(async (videoId) => {
      const progress = await getProgress(videoId);
      if (progress) {
        progressMap[videoId] = progress;
      }
    })
  );

  return progressMap;
}

/**
 * Calculate completion percentage for a video
 * @param {number} watchedSeconds - Seconds watched
 * @param {number} totalSeconds - Total video duration
 * @returns {number} Percentage completed (0-100)
 */
export function calculateCompletionPercentage(watchedSeconds, totalSeconds) {
  if (!totalSeconds || totalSeconds <= 0) return 0;
  const percentage = (watchedSeconds / totalSeconds) * 100;
  return Math.min(100, Math.round(percentage));
}

/**
 * Format duration in seconds to human readable format
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration (e.g., "5:30" or "1:05:30")
 */
export function formatDuration(seconds) {
  if (!seconds || seconds < 0) return '0:00';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

export default {
  updateProgress,
  getProgress,
  getMultipleProgress,
  calculateCompletionPercentage,
  formatDuration,
};
