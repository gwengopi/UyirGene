import { VIDEO_TYPES } from './constants';

/**
 * Detect video type from URL
 * @param {string} url - Video URL
 * @returns {string} - Video type constant
 */
export function getVideoType(url) {
  if (!url) return VIDEO_TYPES.UNKNOWN;

  // YouTube
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return VIDEO_TYPES.YOUTUBE;
  }

  // Google Drive
  if (url.includes('drive.google.com')) {
    return VIDEO_TYPES.GOOGLE_DRIVE;
  }

  // Google Classroom (usually redirects to Drive)
  if (url.includes('classroom.google.com')) {
    return VIDEO_TYPES.GOOGLE_CLASSROOM;
  }

  // Vimeo
  if (url.includes('vimeo.com')) {
    return VIDEO_TYPES.VIMEO;
  }

  // Direct video file
  if (url.match(/\.(mp4|webm|ogg|mov)(\?|$)/i)) {
    return VIDEO_TYPES.DIRECT;
  }

  return VIDEO_TYPES.UNKNOWN;
}

/**
 * Convert video URL to embed URL for iframe-based players
 * @param {string} url - Original video URL
 * @param {string} type - Video type
 * @returns {string} - Embed URL
 */
export function getEmbedUrl(url, type) {
  switch (type) {
    case VIDEO_TYPES.YOUTUBE: {
      // Handle various YouTube URL formats
      let videoId = '';
      if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1]?.split('?')[0];
      } else if (url.includes('v=')) {
        videoId = url.split('v=')[1]?.split('&')[0];
      } else if (url.includes('embed/')) {
        videoId = url.split('embed/')[1]?.split('?')[0];
      }

      // YouTube embed parameters for privacy and minimal branding
      const params = new URLSearchParams({
        enablejsapi: '1',
        rel: '0',
        modestbranding: '1',
        iv_load_policy: '3',
        fs: '0',
        playsinline: '1',
        controls: '1',
        showinfo: '0',
        cc_load_policy: '0',
        disablekb: '0',
        loop: '0',
        origin: typeof window !== 'undefined' ? window.location.origin : '',
      });

      if (videoId) {
        params.set('playlist', videoId);
      }

      return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}` : url;
    }

    case VIDEO_TYPES.GOOGLE_DRIVE: {
      // Convert Google Drive URL to embed URL
      let fileId = '';
      if (url.includes('/file/d/')) {
        fileId = url.split('/file/d/')[1]?.split('/')[0];
      } else if (url.includes('id=')) {
        fileId = url.split('id=')[1]?.split('&')[0];
      }
      return fileId ? `https://drive.google.com/file/d/${fileId}/preview` : url;
    }

    case VIDEO_TYPES.VIMEO: {
      const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
      // Vimeo embed parameters for minimal branding
      const params = new URLSearchParams({
        title: '0',
        byline: '0',
        portrait: '0',
        badge: '0',
        dnt: '1',
      });
      return videoId ? `https://player.vimeo.com/video/${videoId}?${params.toString()}` : url;
    }

    case VIDEO_TYPES.GOOGLE_CLASSROOM:
      // Google Classroom typically redirects to Google Drive
      return url;

    default:
      return url;
  }
}

/**
 * Format time in seconds to MM:SS or HH:MM:SS format
 * @param {number} seconds - Time in seconds
 * @returns {string} - Formatted time string
 */
export function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00';

  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Check if browser supports Picture-in-Picture
 * @returns {boolean}
 */
export function isPiPSupported() {
  return typeof document !== 'undefined' && 'pictureInPictureEnabled' in document;
}

/**
 * Check if browser supports Fullscreen API
 * @returns {boolean}
 */
export function isFullscreenSupported() {
  return typeof document !== 'undefined' && (
    document.fullscreenEnabled ||
    document.webkitFullscreenEnabled ||
    document.mozFullScreenEnabled ||
    document.msFullscreenEnabled
  );
}
