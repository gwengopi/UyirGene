import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Box, Paper, IconButton } from '@mui/material';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import Watermark from './Watermark';
import { PROGRESS_SAVE_INTERVAL } from '../utils/constants';

/**
 * Embedded video player for YouTube, Vimeo, Google Drive
 * Uses iframe with overlay protections
 */
function EmbeddedPlayer({ src, title, onProgress, onComplete, initialPosition = 0, userEmail }) {
  const containerRef = useRef(null);
  const iframeRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const progressRef = useRef(initialPosition);
  const completedRef = useRef(false);

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Detect user interaction with iframe (focus = likely playing)
  useEffect(() => {
    const handleFocus = () => {
      // When iframe gets focus, user likely clicked play
      setIsPlaying(true);
    };

    const handleBlur = () => {
      // Small delay to avoid false negatives from brief focus changes
      setTimeout(() => {
        if (document.activeElement !== iframeRef.current) {
          setIsPlaying(false);
        }
      }, 200);
    };

    window.addEventListener('blur', handleFocus);
    window.addEventListener('focus', handleBlur);

    return () => {
      window.removeEventListener('blur', handleFocus);
      window.removeEventListener('focus', handleBlur);
    };
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

  // Save progress periodically (approximate for embedded players, only when playing)
  useEffect(() => {
    if (!isPlaying || !onProgress) return;

    const interval = setInterval(() => {
      progressRef.current += PROGRESS_SAVE_INTERVAL;
      onProgress(progressRef.current);
    }, PROGRESS_SAVE_INTERVAL * 1000);

    return () => clearInterval(interval);
  }, [isPlaying, onProgress]);

  // Save progress on unmount
  useEffect(() => {
    return () => {
      if (progressRef.current > 0 && onProgress) {
        onProgress(progressRef.current);
      }
    };
  }, [onProgress]);

  return (
    <Paper
      ref={containerRef}
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
      sx={{
        position: 'relative',
        backgroundColor: 'black',
        borderRadius: 2,
        overflow: 'hidden',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        WebkitTouchCallout: 'none',
      }}
    >
      {/* Aspect ratio container */}
      <Box
        sx={{
          position: 'relative',
          paddingTop: '56.25%', // 16:9 aspect ratio
          width: '100%',
        }}
      >
        {/* Iframe */}
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

        {/* TOP OVERLAY: Block channel name, title, share buttons */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '80px',
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 100%)',
            zIndex: 10,
            pointerEvents: 'auto',
            cursor: 'default',
          }}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
          onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
        />

        {/* RIGHT EDGE: Block YouTube watermark */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            width: '80px',
            backgroundColor: 'transparent',
            zIndex: 10,
            pointerEvents: 'auto',
            cursor: 'default',
          }}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
          onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
        />

        {/* BOTTOM-RIGHT: Block YouTube logo in control bar */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: '200px',
            height: '50px',
            backgroundColor: 'transparent',
            zIndex: 11,
            pointerEvents: 'auto',
            cursor: 'default',
          }}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
          onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
        />

        {/* BOTTOM-LEFT: Block "Watch on YouTube" text */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '60px',
            height: '50px',
            backgroundColor: 'transparent',
            zIndex: 11,
            pointerEvents: 'auto',
            cursor: 'default',
          }}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
          onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
        />

        {/* LEFT EDGE: Block any left-side overlays */}
        <Box
          sx={{
            position: 'absolute',
            top: '80px',
            left: 0,
            bottom: '50px',
            width: '60px',
            backgroundColor: 'transparent',
            zIndex: 10,
            pointerEvents: 'auto',
            cursor: 'default',
          }}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
          onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
        />

        {/* Watermark overlay */}
        <Watermark userEmail={userEmail} />
      </Box>

      {/* Fullscreen button */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 8,
          right: 8,
          zIndex: 15,
        }}
      >
        <IconButton
          onClick={toggleFullscreen}
          aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          sx={{
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            '&:hover': {
              backgroundColor: 'rgba(79, 102, 114, 0.9)',
            },
          }}
        >
          {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
        </IconButton>
      </Box>
    </Paper>
  );
}

export default EmbeddedPlayer;
