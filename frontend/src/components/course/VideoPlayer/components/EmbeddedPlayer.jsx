import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Box, Paper, IconButton } from '@mui/material';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import Watermark from './Watermark';
import { PROGRESS_SAVE_INTERVAL } from '../utils/constants';

/**
 * Embedded video player for YouTube, Vimeo, Google Drive.
 *
 * Completion detection — transparent click interceptor overlay:
 *   - Sits above the iframe (zIndex 9), below branding overlays (zIndex 10+).
 *   - First click anywhere on the video fires onPlay (marks complete) and
 *     removes itself so future clicks reach the iframe.
 *   - For YouTube (enablejsapi=1 already in URL): also sends a postMessage
 *     playVideo command so the video starts automatically on first click.
 */
function EmbeddedPlayer({ src, title, onProgress, onComplete, onPlay, initialPosition = 0, userEmail }) {
  const containerRef = useRef(null);
  const iframeRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const hasPlayedRef = useRef(false);
  const [overlayActive, setOverlayActive] = useState(true);
  const progressRef = useRef(initialPosition);

  const isYouTube = Boolean(src && (src.includes('youtube') || src.includes('youtu.be')));

  // Reset on every new video
  useEffect(() => {
    hasPlayedRef.current = false;
    setOverlayActive(true);
    progressRef.current = initialPosition;
  }, [src, initialPosition]);

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Detect isPlaying via window blur/focus (for progress interval only)
  useEffect(() => {
    const handleBlur = () => setIsPlaying(true);
    const handleFocus = () => {
      setTimeout(() => {
        if (document.activeElement !== iframeRef.current) setIsPlaying(false);
      }, 200);
    };
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // First-click overlay: marks complete, removes itself, auto-plays YouTube
  const handleOverlayClick = useCallback(() => {
    // Mark as complete exactly once
    if (!hasPlayedRef.current) {
      hasPlayedRef.current = true;
      onPlay?.();
    }
    // Remove overlay so future clicks go straight to the iframe
    setOverlayActive(false);
    setIsPlaying(true);

    // For YouTube: send playVideo command so the video starts automatically
    // (enablejsapi=1 is already in the embed URL, so this command is accepted)
    if (isYouTube && iframeRef.current) {
      try {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func: 'playVideo', args: [] }),
          '*'
        );
      } catch (_) {}
    }
  }, [onPlay, isYouTube]);

  const toggleFullscreen = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    if (!document.fullscreenElement) {
      container.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }, []);

  // Save progress periodically
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
      if (progressRef.current > 0 && onProgress) onProgress(progressRef.current);
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
      {/* 16:9 aspect ratio container */}
      <Box sx={{ position: 'relative', paddingTop: '56.25%', width: '100%' }}>

        {/* Iframe */}
        <iframe
          ref={iframeRef}
          src={src}
          title={title}
          style={{
            position: 'absolute', top: 0, left: 0,
            width: '100%', height: '100%', border: 'none',
          }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
        />

        {/* ── Transparent first-click interceptor ── */}
        {/* Covers the whole player (below branding overlays at z=10+).    */}
        {/* First click → onPlay fired + overlay removed + YouTube plays.  */}
        {overlayActive && (
          <Box
            sx={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              zIndex: 9,
              cursor: 'pointer',
              backgroundColor: 'transparent',
            }}
            onClick={handleOverlayClick}
          />
        )}

        {/* ── Branding overlays (always on top of the interceptor) ── */}

        {/* TOP: Block channel name, title, share buttons */}
        <Box sx={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '80px',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 100%)',
          zIndex: 10, pointerEvents: 'auto', cursor: 'default',
        }}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
          onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
        />

        {/* RIGHT EDGE: Block YouTube watermark */}
        <Box sx={{
          position: 'absolute', top: 0, right: 0, bottom: 0, width: '80px',
          zIndex: 10, pointerEvents: 'auto', cursor: 'default',
        }}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
          onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
        />

        {/* BOTTOM-RIGHT: Block YouTube logo */}
        <Box sx={{
          position: 'absolute', bottom: 0, right: 0, width: '200px', height: '50px',
          zIndex: 11, pointerEvents: 'auto', cursor: 'default',
        }}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
          onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
        />

        {/* BOTTOM-LEFT: Block "Watch on YouTube" */}
        <Box sx={{
          position: 'absolute', bottom: 0, left: 0, width: '60px', height: '50px',
          zIndex: 11, pointerEvents: 'auto', cursor: 'default',
        }}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
          onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
        />

        {/* LEFT EDGE */}
        <Box sx={{
          position: 'absolute', top: '80px', left: 0, bottom: '50px', width: '60px',
          zIndex: 10, pointerEvents: 'auto', cursor: 'default',
        }}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
          onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
        />

        {/* Watermark */}
        <Watermark userEmail={userEmail} />
      </Box>

      {/* Fullscreen button */}
      <Box sx={{ position: 'absolute', bottom: 8, right: 8, zIndex: 15 }}>
        <IconButton
          onClick={toggleFullscreen}
          aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          sx={{
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            '&:hover': { backgroundColor: 'rgba(79, 102, 114, 0.9)' },
          }}
        >
          {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
        </IconButton>
      </Box>
    </Paper>
  );
}

export default EmbeddedPlayer;
