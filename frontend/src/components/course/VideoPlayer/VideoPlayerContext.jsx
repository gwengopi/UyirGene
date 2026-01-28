import React, { createContext, useContext, useState, useCallback } from 'react';
import { DEFAULT_PLAYBACK_SPEED } from './utils/constants';

const VideoPlayerContext = createContext(null);

/**
 * Video Player Context Provider
 * Manages shared state across video player components
 */
export function VideoPlayerProvider({ children }) {
  // Player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(DEFAULT_PLAYBACK_SPEED);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPiP, setIsPiP] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Toggle functions
  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev);
  }, []);

  const togglePiP = useCallback(() => {
    setIsPiP((prev) => !prev);
  }, []);

  const toggleShortcutsHelp = useCallback(() => {
    setShowShortcutsHelp((prev) => !prev);
  }, []);

  const value = {
    // State
    isPlaying,
    currentTime,
    duration,
    buffered,
    volume,
    isMuted,
    playbackSpeed,
    isFullscreen,
    isPiP,
    showControls,
    showShortcutsHelp,
    showResumePrompt,
    isLoading,

    // Setters
    setIsPlaying,
    setCurrentTime,
    setDuration,
    setBuffered,
    setVolume,
    setIsMuted,
    setPlaybackSpeed,
    setIsFullscreen,
    setIsPiP,
    setShowControls,
    setShowShortcutsHelp,
    setShowResumePrompt,
    setIsLoading,

    // Toggles
    togglePlay,
    toggleMute,
    toggleFullscreen,
    togglePiP,
    toggleShortcutsHelp,
  };

  return (
    <VideoPlayerContext.Provider value={value}>
      {children}
    </VideoPlayerContext.Provider>
  );
}

/**
 * Hook to access video player context
 * @returns {object} Video player context value
 */
export function useVideoPlayerContext() {
  const context = useContext(VideoPlayerContext);
  if (!context) {
    throw new Error('useVideoPlayerContext must be used within a VideoPlayerProvider');
  }
  return context;
}

export default VideoPlayerContext;
