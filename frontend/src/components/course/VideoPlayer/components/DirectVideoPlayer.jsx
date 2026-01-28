import React, { useRef, useCallback, useEffect } from 'react';
import { Box, Paper, CircularProgress } from '@mui/material';
import { useVideoPlayerContext } from '../VideoPlayerContext';
import { useVideoPlayer } from '../hooks/useVideoPlayer';
import { useFullscreen } from '../hooks/useFullscreen';
import { usePictureInPicture } from '../hooks/usePictureInPicture';
import VideoControls from './VideoControls';
import BrandedPlayButton from './BrandedPlayButton';
import Watermark from './Watermark';
import KeyboardShortcutsHelp from './KeyboardShortcutsHelp';
import ResumePrompt from './ResumePrompt';
import { CONTROLS_HIDE_TIMEOUT, SEEK_AMOUNT, VOLUME_CHANGE_AMOUNT, RESUME_PROMPT_THRESHOLD } from '../utils/constants';

/**
 * Direct video player for MP4, WebM, OGG files
 * Full custom controls and anti-piracy features
 */
function DirectVideoPlayer({
  src,
  poster,
  title,
  initialPosition = 0,
  onProgress,
  onComplete,
  autoPlay = false,
  userEmail,
}) {
  const containerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  const {
    isPlaying,
    isLoading,
    showControls,
    setShowControls,
    showShortcutsHelp,
    setShowShortcutsHelp,
    showResumePrompt,
    setShowResumePrompt,
  } = useVideoPlayerContext();

  const {
    videoRef,
    togglePlay,
    seek,
    seekRelative,
    changeVolume,
    toggleMute,
    changeSpeed,
    cycleSpeedUp,
    cycleSpeedDown,
    handleLoadedMetadata,
    handleTimeUpdate,
    handleEnded,
    handleWaiting,
    handleCanPlay,
  } = useVideoPlayer({ initialPosition, onProgress, onComplete });

  const { toggleFullscreen } = useFullscreen(containerRef);
  const { togglePiP } = usePictureInPicture(videoRef);

  // Show resume prompt if needed
  useEffect(() => {
    if (initialPosition > RESUME_PROMPT_THRESHOLD) {
      setShowResumePrompt(true);
    }
  }, [initialPosition, setShowResumePrompt]);

  // Handle resume prompt response
  const handleResume = useCallback(() => {
    setShowResumePrompt(false);
    seek(initialPosition);
  }, [initialPosition, seek, setShowResumePrompt]);

  const handleStartOver = useCallback(() => {
    setShowResumePrompt(false);
    seek(0);
  }, [seek, setShowResumePrompt]);

  // Auto-hide controls
  const resetControlsTimeout = useCallback(() => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }

    setShowControls(true);

    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, CONTROLS_HIDE_TIMEOUT);
    }
  }, [isPlaying, setShowControls]);

  // Handle mouse movement
  const handleMouseMove = useCallback(() => {
    resetControlsTimeout();
  }, [resetControlsTimeout]);

  // Handle mouse leave
  const handleMouseLeave = useCallback(() => {
    if (isPlaying) {
      setShowControls(false);
    }
  }, [isPlaying, setShowControls]);

  // Double-click for fullscreen
  const handleDoubleClick = useCallback((e) => {
    // Prevent triggering on controls
    if (e.target === videoRef.current || e.target === containerRef.current) {
      toggleFullscreen();
    }
  }, [toggleFullscreen, videoRef]);

  // Keyboard controls
  const handleKeyDown = useCallback((e) => {
    // Ignore if typing in an input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
      return;
    }

    switch (e.key) {
      case ' ':
      case 'k':
        e.preventDefault();
        togglePlay();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        seekRelative(-SEEK_AMOUNT);
        break;
      case 'ArrowRight':
        e.preventDefault();
        seekRelative(SEEK_AMOUNT);
        break;
      case 'ArrowUp':
        e.preventDefault();
        changeVolume(videoRef.current?.volume + VOLUME_CHANGE_AMOUNT);
        break;
      case 'ArrowDown':
        e.preventDefault();
        changeVolume(videoRef.current?.volume - VOLUME_CHANGE_AMOUNT);
        break;
      case 'm':
        e.preventDefault();
        toggleMute();
        break;
      case 'f':
        e.preventDefault();
        toggleFullscreen();
        break;
      case 'p':
        e.preventDefault();
        togglePiP();
        break;
      case '<':
      case ',':
        e.preventDefault();
        cycleSpeedDown();
        break;
      case '>':
      case '.':
        e.preventDefault();
        cycleSpeedUp();
        break;
      case '?':
        e.preventDefault();
        setShowShortcutsHelp(true);
        break;
      case 'Escape':
        e.preventDefault();
        if (showShortcutsHelp) {
          setShowShortcutsHelp(false);
        }
        break;
      // Number keys for seeking to percentage
      case '0':
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6':
      case '7':
      case '8':
      case '9':
        e.preventDefault();
        const percentage = parseInt(e.key) / 10;
        const duration = videoRef.current?.duration || 0;
        seek(duration * percentage);
        break;
      default:
        break;
    }

    resetControlsTimeout();
  }, [
    togglePlay,
    seekRelative,
    changeVolume,
    toggleMute,
    toggleFullscreen,
    togglePiP,
    cycleSpeedUp,
    cycleSpeedDown,
    setShowShortcutsHelp,
    showShortcutsHelp,
    seek,
    resetControlsTimeout,
    videoRef,
  ]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  return (
    <Paper
      ref={containerRef}
      tabIndex={0}
      role="application"
      aria-label={`Video player: ${title}`}
      onKeyDown={handleKeyDown}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onDoubleClick={handleDoubleClick}
      onContextMenu={(e) => e.preventDefault()}
      sx={{
        position: 'relative',
        backgroundColor: 'black',
        borderRadius: 2,
        overflow: 'hidden',
        outline: 'none',
        '&:focus-visible': {
          outline: '2px solid',
          outlineColor: 'primary.main',
          outlineOffset: 2,
        },
        // Anti-piracy CSS
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        WebkitTouchCallout: 'none',
      }}
    >
      {/* Video element */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        onClick={togglePlay}
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onWaiting={handleWaiting}
        onCanPlay={handleCanPlay}
        autoPlay={autoPlay}
        playsInline
        controlsList="nodownload nofullscreen noremoteplayback"
        disablePictureInPicture={false}
        style={{
          width: '100%',
          display: 'block',
          cursor: 'pointer',
        }}
        onDragStart={(e) => e.preventDefault()}
      />

      {/* Loading indicator */}
      {isLoading && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 10,
          }}
        >
          <CircularProgress color="primary" size={60} />
        </Box>
      )}

      {/* Play button overlay */}
      {!isPlaying && !isLoading && (
        <BrandedPlayButton onClick={togglePlay} />
      )}

      {/* Watermark */}
      <Watermark userEmail={userEmail} />

      {/* Controls */}
      <VideoControls
        onTogglePlay={togglePlay}
        onSeek={seek}
        onVolumeChange={changeVolume}
        onToggleMute={toggleMute}
        onSpeedChange={changeSpeed}
        onToggleFullscreen={toggleFullscreen}
        onTogglePiP={togglePiP}
        onShowHelp={() => setShowShortcutsHelp(true)}
      />

      {/* Keyboard shortcuts help modal */}
      <KeyboardShortcutsHelp
        open={showShortcutsHelp}
        onClose={() => setShowShortcutsHelp(false)}
      />

      {/* Resume prompt */}
      <ResumePrompt
        open={showResumePrompt}
        position={initialPosition}
        onResume={handleResume}
        onStartOver={handleStartOver}
      />
    </Paper>
  );
}

export default DirectVideoPlayer;
