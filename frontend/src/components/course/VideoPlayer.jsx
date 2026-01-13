import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { Box, IconButton, Slider, Typography, Paper } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import { formatDuration } from '../../utils/formatters';
import { DEFAULTS } from '../../utils/constants';

/**
 * Detect video type from URL
 */
function getVideoType(url) {
  if (!url) return 'unknown';

  // YouTube
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return 'youtube';
  }

  // Google Drive
  if (url.includes('drive.google.com')) {
    return 'googledrive';
  }

  // Google Classroom (usually redirects to Drive)
  if (url.includes('classroom.google.com')) {
    return 'googleclassroom';
  }

  // Vimeo
  if (url.includes('vimeo.com')) {
    return 'vimeo';
  }

  // Direct video file
  if (url.match(/\.(mp4|webm|ogg|mov)(\?|$)/i)) {
    return 'direct';
  }

  return 'unknown';
}

/**
 * Convert video URL to embed URL
 */
function getEmbedUrl(url, type) {
  switch (type) {
    case 'youtube': {
      // Handle various YouTube URL formats
      let videoId = '';
      if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1]?.split('?')[0];
      } else if (url.includes('v=')) {
        videoId = url.split('v=')[1]?.split('&')[0];
      } else if (url.includes('embed/')) {
        videoId = url.split('embed/')[1]?.split('?')[0];
      }
      return videoId ? `https://www.youtube.com/embed/${videoId}?enablejsapi=1&rel=0` : url;
    }

    case 'googledrive': {
      // Convert Google Drive URL to embed URL
      let fileId = '';
      if (url.includes('/file/d/')) {
        fileId = url.split('/file/d/')[1]?.split('/')[0];
      } else if (url.includes('id=')) {
        fileId = url.split('id=')[1]?.split('&')[0];
      }
      return fileId ? `https://drive.google.com/file/d/${fileId}/preview` : url;
    }

    case 'vimeo': {
      const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
      return videoId ? `https://player.vimeo.com/video/${videoId}` : url;
    }

    default:
      return url;
  }
}

/**
 * Embedded Video Player (YouTube, Google Drive, Vimeo)
 */
function EmbeddedPlayer({ src, title, onProgress, initialPosition = 0 }) {
  const iframeRef = useRef(null);
  const containerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }, []);

  // Save progress periodically (approximate for embedded players)
  useEffect(() => {
    const interval = setInterval(() => {
      // For embedded videos, we can't easily track progress
      // Just save that they've been watching
      if (onProgress) {
        onProgress(initialPosition + 10);
      }
    }, DEFAULTS.VIDEO.PROGRESS_SAVE_INTERVAL * 1000);

    return () => clearInterval(interval);
  }, [initialPosition, onProgress]);

  return (
    <Paper
      ref={containerRef}
      sx={{
        position: 'relative',
        backgroundColor: 'black',
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          position: 'relative',
          paddingTop: '56.25%', // 16:9 aspect ratio
          width: '100%',
        }}
      >
        <iframe
          ref={iframeRef}
          src={src}
          title={title}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            border: 'none',
          }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
        />
      </Box>

      {/* Minimal controls for embedded */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 8,
          right: 8,
          zIndex: 10,
        }}
      >
        <IconButton
          onClick={toggleFullscreen}
          sx={{
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            color: 'white',
            '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.8)' },
          }}
          aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        >
          {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
        </IconButton>
      </Box>
    </Paper>
  );
}

/**
 * Direct Video Player with full controls
 */
function DirectVideoPlayer({
  src,
  poster,
  title,
  initialPosition = 0,
  onProgress,
  onComplete,
  autoPlay = false,
}) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const progressIntervalRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(initialPosition);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [lastSavedPosition, setLastSavedPosition] = useState(initialPosition);

  // Initialize video
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      if (initialPosition > 0) {
        video.currentTime = initialPosition;
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      onComplete?.();
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
    };
  }, [initialPosition, onComplete]);

  // Save progress periodically
  useEffect(() => {
    if (isPlaying) {
      progressIntervalRef.current = setInterval(() => {
        const video = videoRef.current;
        if (video && Math.abs(video.currentTime - lastSavedPosition) >= DEFAULTS.VIDEO.PROGRESS_SAVE_INTERVAL) {
          onProgress?.(Math.floor(video.currentTime));
          setLastSavedPosition(video.currentTime);
        }
      }, 5000);
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [isPlaying, lastSavedPosition, onProgress]);

  // Save progress on unmount
  useEffect(() => {
    return () => {
      const video = videoRef.current;
      if (video && video.currentTime > 0) {
        onProgress?.(Math.floor(video.currentTime));
      }
    };
  }, [onProgress]);

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const handleSeek = useCallback((_, value) => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = value;
    setCurrentTime(value);
  }, []);

  const handleVolumeChange = useCallback((_, value) => {
    const video = videoRef.current;
    if (!video) return;

    video.volume = value;
    setVolume(value);
    setIsMuted(value === 0);
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isMuted) {
      video.muted = false;
      setIsMuted(false);
    } else {
      video.muted = true;
      setIsMuted(true);
    }
  }, [isMuted]);

  const toggleFullscreen = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }, []);

  // Keyboard controls
  const handleKeyDown = useCallback(
    (e) => {
      switch (e.key) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (videoRef.current) {
            videoRef.current.currentTime = Math.max(0, currentTime - 10);
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (videoRef.current) {
            videoRef.current.currentTime = Math.min(duration, currentTime + 10);
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          handleVolumeChange(null, Math.min(1, volume + 0.1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          handleVolumeChange(null, Math.max(0, volume - 0.1));
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        default:
          break;
      }
    },
    [togglePlay, currentTime, duration, volume, handleVolumeChange, toggleMute, toggleFullscreen]
  );

  return (
    <Paper
      ref={containerRef}
      sx={{
        position: 'relative',
        backgroundColor: 'black',
        borderRadius: 2,
        overflow: 'hidden',
      }}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="application"
      aria-label={`Video player: ${title}`}
    >
      {/* Video element */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        onClick={togglePlay}
        style={{
          width: '100%',
          display: 'block',
          cursor: 'pointer',
        }}
        autoPlay={autoPlay}
        playsInline
      />

      {/* Play button overlay */}
      {!isPlaying && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            cursor: 'pointer',
          }}
          onClick={togglePlay}
        >
          <IconButton
            sx={{
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              color: 'white',
              '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.8)' },
              width: 80,
              height: 80,
            }}
            aria-label="Play video"
          >
            <PlayArrowIcon sx={{ fontSize: 48 }} />
          </IconButton>
        </Box>
      )}

      {/* Controls */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'linear-gradient(transparent, rgba(0, 0, 0, 0.8))',
          p: 2,
          opacity: showControls ? 1 : 0,
          transition: 'opacity 0.3s',
        }}
      >
        {/* Progress bar */}
        <Slider
          value={currentTime}
          max={duration || 100}
          onChange={handleSeek}
          aria-label="Video progress"
          sx={{
            color: 'primary.main',
            height: 4,
            '& .MuiSlider-thumb': {
              width: 12,
              height: 12,
            },
          }}
        />

        {/* Controls row */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            onClick={togglePlay}
            color="inherit"
            aria-label={isPlaying ? 'Pause' : 'Play'}
            sx={{ color: 'white' }}
          >
            {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
          </IconButton>

          <Typography variant="body2" sx={{ color: 'white', minWidth: 100 }}>
            {formatDuration(currentTime)} / {formatDuration(duration)}
          </Typography>

          <Box sx={{ flex: 1 }} />

          <Box sx={{ display: 'flex', alignItems: 'center', width: 120 }}>
            <IconButton
              onClick={toggleMute}
              color="inherit"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
              sx={{ color: 'white' }}
            >
              {isMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
            </IconButton>
            <Slider
              value={isMuted ? 0 : volume}
              min={0}
              max={1}
              step={0.1}
              onChange={handleVolumeChange}
              aria-label="Volume"
              sx={{ color: 'white' }}
            />
          </Box>

          <IconButton
            onClick={toggleFullscreen}
            color="inherit"
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            sx={{ color: 'white' }}
          >
            {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
          </IconButton>
        </Box>
      </Box>
    </Paper>
  );
}

/**
 * Main Video Player component that handles different video sources
 */
function VideoPlayer({
  src,
  poster,
  title,
  initialPosition = 0,
  onProgress,
  onComplete,
  autoPlay = false,
}) {
  const videoType = useMemo(() => getVideoType(src), [src]);
  const embedUrl = useMemo(() => getEmbedUrl(src, videoType), [src, videoType]);

  // Use embedded player for YouTube, Google Drive, Vimeo
  if (['youtube', 'googledrive', 'googleclassroom', 'vimeo'].includes(videoType)) {
    return (
      <EmbeddedPlayer
        src={embedUrl}
        title={title}
        onProgress={onProgress}
        initialPosition={initialPosition}
      />
    );
  }

  // Use direct video player for direct video files
  return (
    <DirectVideoPlayer
      src={src}
      poster={poster}
      title={title}
      initialPosition={initialPosition}
      onProgress={onProgress}
      onComplete={onComplete}
      autoPlay={autoPlay}
    />
  );
}

export default VideoPlayer;
