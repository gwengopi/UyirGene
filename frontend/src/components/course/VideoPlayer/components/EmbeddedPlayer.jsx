import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Box, Paper, IconButton } from '@mui/material';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import Watermark from './Watermark';
import { PROGRESS_SAVE_INTERVAL } from '../utils/constants';

/**
 * Embedded video player for YouTube, Vimeo, Google Drive
 * Uses iframe with overlay protections
 *
 * Completion detection:
 *  - YouTube: listens for postMessage onStateChange event (state 1 = playing)
 *  - Others: transparent first-click interceptor overlay
 */
function EmbeddedPlayer({ src, title, onProgress, onComplete, onPlay, initialPosition = 0, userEmail }) {
  const containerRef = useRef(null);
  const iframeRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const hasPlayedRef = useRef(false);
  // For non-YouTube: whether the transparent click overlay is still active
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
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // ── YouTube: detect play via postMessage ───────────────────────────────────
  // YouTube IFrame API fires window.message events when state changes.
  // State 1 = PLAYING. The embed URL already has enablejsapi=1.
  useEffect(() => {
    if (!isYouTube) return;

    const handleMessage = (event) => {
      if (hasPlayedRef.current) return;
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        // YouTube state change: info 1 = playing
        if (data && data.event === 'onStateChange' && data.info === 1) {
          hasPlayedRef.current = true;
          setIsPlaying(true);
          onPlay?.();
        }
      } catch (_) {
        // Not a YouTube message, ignore
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [isYouTube, onPlay]);

  // ── Non-YouTube: track isPlaying via window blur/focus ────────────────────
  // (used only for progress tracking interval, not for completion)
  useEffect(() => {
    if (isYouTube) return;

    const handleBlur = () => setIsPlaying(true);
    const handleFocus = () => {
      setTimeout(() => {
        if (document.activeElement !== iframeRef.current) {
          setIsPlaying(false);
        }
      }, 200);
    };

    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
    };
  }, [isYouTube]);

  // ── First-click overlay handler (non-YouTube) ─────────────────────────────
  const handleOverlayClick = useCallback(() => {
    // Fire onPlay exactly once
    if (!hasPlayedRef.current) {
      hasPlayedRef.current = true;
      onPlay?.();
    }
    // Remove overlay so future clicks reach the iframe
    setOverlayActive(false);
    setIsPlaying(true);
  }, [onPlay]);

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
      <Box sx={{ position: 'relative', paddingTop: '56.25%', width: '100%' }}>

        {/* Iframe */}
        <iframe
          ref={iframeRef}
          src={src}
          title={title}
          style={{
            position: 'absolute',
            top: 0, left: 0,
            width: '100%', height: '100%',
            border: 'none',
          }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
        />

        {/* ── Branding overlays ── */}

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

        {/* ── Non-YouTube: transparent click interceptor for first click ── */}
        {/* Sits above iframe (z=9) but below branding overlays (z=10+).    */}
        {/* After first click it removes itself so subsequent clicks reach   */}
        {/* the iframe normally.                                             */}
        {!isYouTube && overlayActive && (
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
