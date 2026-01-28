import React, { useMemo } from 'react';
import { VideoPlayerProvider } from './VideoPlayerContext';
import DirectVideoPlayer from './components/DirectVideoPlayer';
import EmbeddedPlayer from './components/EmbeddedPlayer';
import { getVideoType, getEmbedUrl } from './utils/videoUtils';
import { EMBEDDED_TYPES } from './utils/constants';

/**
 * Main Video Player component
 * Automatically detects video type and renders appropriate player
 *
 * @param {string} src - Video URL (decrypted)
 * @param {string} title - Video title
 * @param {number} initialPosition - Resume position in seconds
 * @param {function} onProgress - Callback for progress updates
 * @param {function} onComplete - Callback when video completes
 * @param {string} poster - Poster image URL (optional)
 * @param {boolean} autoPlay - Auto-play video (optional)
 * @param {string} userEmail - User email for watermark (optional)
 */
function VideoPlayer({
  src,
  poster,
  title,
  initialPosition = 0,
  onProgress,
  onComplete,
  autoPlay = false,
  userEmail,
}) {
  // Detect video type
  const videoType = useMemo(() => getVideoType(src), [src]);

  // Get embed URL for iframe-based players
  const embedUrl = useMemo(() => getEmbedUrl(src, videoType), [src, videoType]);

  // Determine if video should use embedded player
  const isEmbedded = EMBEDDED_TYPES.includes(videoType);

  return (
    <VideoPlayerProvider>
      {isEmbedded ? (
        <EmbeddedPlayer
          src={embedUrl}
          title={title}
          initialPosition={initialPosition}
          onProgress={onProgress}
          userEmail={userEmail}
        />
      ) : (
        <DirectVideoPlayer
          src={src}
          poster={poster}
          title={title}
          initialPosition={initialPosition}
          onProgress={onProgress}
          onComplete={onComplete}
          autoPlay={autoPlay}
          userEmail={userEmail}
        />
      )}
    </VideoPlayerProvider>
  );
}

export default VideoPlayer;
