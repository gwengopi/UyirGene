import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Box, Paper, IconButton } from '@mui/material';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
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
  // 'none' | 'paused' | 'ended'
  const [ytSuggestionsState, setYtSuggestionsState] = useState('none');
  const progressRef = useRef(initialPosition);

  const isYouTube = Boolean(src && (src.includes('youtube') || src.includes('youtu.be')));

  // Reset on every new video
  useEffect(() => {
    hasPlayedRef.current = false;
    setOverlayActive(true);
    setYtSuggestionsState('none');
    progressRef.current = initialPosition;
  }, [src, initialPosition]);

  // Subscribe to YouTube iframe events once the iframe has loaded.
  // Without sending 'listening', YouTube may not emit postMessage events.
  const handleIframeLoad = useCallback(() => {
    if (isYouTube && iframeRef.current) {
      try {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'listening', id: 1 }),
          '*'
        );
      } catch (_) {}
    }
  }, [isYouTube]);

  // Listen for YouTube state changes to block end-screen / pause suggestions.
  // YouTube sends two formats: { event:'onStateChange', info:STATE } and
  // { event:'infoDelivery', info:{ playerState:STATE, ... } } — handle both.
  useEffect(() => {
    if (!isYouTube) return;
    const handleMessage = (e) => {
      try {
        const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
        if (!data || typeof data !== 'object') return;

        let state = null;
        if (data.event === 'onStateChange' && typeof data.info === 'number') {
          state = data.info;
        } else if (
          data.event === 'infoDelivery' &&
          data.info &&
          typeof data.info.playerState === 'number'
        ) {
          state = data.info.playerState;
        }
        if (state === null) return;

        if (state === 0) setYtSuggestionsState('ended');
        else if (state === 2) setYtSuggestionsState('paused');
        else setYtSuggestionsState('none');
      } catch (_) {}
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [isYouTube]);

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
          onLoad={handleIframeLoad}
          style={{
            position: 'absolute', top: 0, left: 0,
            width: '100%', height: '100%', border: 'none',
          }}
          allow="accelerometer; autoplay; encrypted-media; gyroscope; fullscreen"
          allowFullScreen
          sandbox="allow-scripts allow-same-origin allow-presentation allow-forms"
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

        {/* ── YouTube end-screen / pause suggestions blocker ── */}
        {/* Opaque overlay that completely hides (and blocks) YouTube's       */}
        {/* suggested-video panels when the video is paused or has ended.     */}
        {/* • paused : covers video area, leaves bottom 50 px for controls;  */}
        {/*            clicking anywhere sends playVideo to resume.           */}
        {/* • ended  : covers the entire player.                             */}
        {isYouTube && ytSuggestionsState !== 'none' && !overlayActive && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: ytSuggestionsState === 'ended' ? 0 : '50px',
              zIndex: 9,
              backgroundColor: 'rgba(0, 0, 0, 0.85)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: ytSuggestionsState === 'paused' ? 'pointer' : 'default',
            }}
            onClick={() => {
              if (ytSuggestionsState === 'paused' && iframeRef.current) {
                iframeRef.current.contentWindow.postMessage(
                  JSON.stringify({ event: 'command', func: 'playVideo', args: [] }),
                  '*'
                );
              }
            }}
          >
            <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.95rem', letterSpacing: '0.03em', pointerEvents: 'none' }}>
              {ytSuggestionsState === 'paused' ? '▶\u2002Click anywhere to resume' : 'Video complete'}
            </span>
          </Box>
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

        {/* RIGHT EDGE: Block YouTube watermark (stops above control bar so settings gear is accessible) */}
        <Box sx={{
          position: 'absolute', top: 0, right: 0, bottom: '50px', width: '80px',
          zIndex: 10, pointerEvents: 'auto', cursor: 'default',
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
