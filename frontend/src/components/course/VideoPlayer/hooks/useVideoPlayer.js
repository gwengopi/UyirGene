import { useRef, useCallback, useEffect } from 'react';
import { useVideoPlayerContext } from '../VideoPlayerContext';
import { PROGRESS_SAVE_INTERVAL, PLAYBACK_SPEEDS } from '../utils/constants';

/**
 * Core video player hook
 * Manages video element interactions and state synchronization
 */
export function useVideoPlayer({
  initialPosition = 0,
  onProgress,
  onComplete,
}) {
  const videoRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const lastSavedPositionRef = useRef(initialPosition);

  const {
    isPlaying,
    setIsPlaying,
    currentTime,
    setCurrentTime,
    duration,
    setDuration,
    setBuffered,
    volume,
    setVolume,
    isMuted,
    setIsMuted,
    playbackSpeed,
    setPlaybackSpeed,
    setIsLoading,
  } = useVideoPlayerContext();

  // Play video
  const play = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      video.play().catch(console.error);
      setIsPlaying(true);
      // Note: onPlay is fired via native HTML5 'play' event in DirectVideoPlayer
    }
  }, [setIsPlaying]);

  // Pause video
  const pause = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      video.pause();
      setIsPlaying(false);
    }
  }, [setIsPlaying]);

  // Toggle play/pause
  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  // Seek to specific time
  const seek = useCallback((time) => {
    const video = videoRef.current;
    if (video) {
      const clampedTime = Math.max(0, Math.min(time, duration));
      video.currentTime = clampedTime;
      setCurrentTime(clampedTime);
    }
  }, [duration, setCurrentTime]);

  // Seek relative to current position
  const seekRelative = useCallback((delta) => {
    seek(currentTime + delta);
  }, [currentTime, seek]);

  // Set volume (0-1)
  const changeVolume = useCallback((newVolume) => {
    const video = videoRef.current;
    if (video) {
      const clampedVolume = Math.max(0, Math.min(1, newVolume));
      video.volume = clampedVolume;
      setVolume(clampedVolume);
      if (clampedVolume > 0) {
        setIsMuted(false);
        video.muted = false;
      }
    }
  }, [setVolume, setIsMuted]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      video.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  }, [isMuted, setIsMuted]);

  // Change playback speed
  const changeSpeed = useCallback((speed) => {
    const video = videoRef.current;
    if (video && PLAYBACK_SPEEDS.includes(speed)) {
      video.playbackRate = speed;
      setPlaybackSpeed(speed);
    }
  }, [setPlaybackSpeed]);

  // Cycle to next playback speed
  const cycleSpeedUp = useCallback(() => {
    const currentIndex = PLAYBACK_SPEEDS.indexOf(playbackSpeed);
    const nextIndex = Math.min(currentIndex + 1, PLAYBACK_SPEEDS.length - 1);
    changeSpeed(PLAYBACK_SPEEDS[nextIndex]);
  }, [playbackSpeed, changeSpeed]);

  // Cycle to previous playback speed
  const cycleSpeedDown = useCallback(() => {
    const currentIndex = PLAYBACK_SPEEDS.indexOf(playbackSpeed);
    const prevIndex = Math.max(currentIndex - 1, 0);
    changeSpeed(PLAYBACK_SPEEDS[prevIndex]);
  }, [playbackSpeed, changeSpeed]);

  // Video event handlers
  const handleLoadedMetadata = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      setDuration(video.duration);
      setIsLoading(false);

      // Seek to initial position if provided
      if (initialPosition > 0 && initialPosition < video.duration) {
        video.currentTime = initialPosition;
        setCurrentTime(initialPosition);
      }
    }
  }, [initialPosition, setDuration, setCurrentTime, setIsLoading]);

  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      setCurrentTime(video.currentTime);

      // Update buffered amount
      if (video.buffered.length > 0) {
        setBuffered(video.buffered.end(video.buffered.length - 1));
      }
    }
  }, [setCurrentTime, setBuffered]);

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    onComplete?.();
  }, [setIsPlaying, onComplete]);

  const handleWaiting = useCallback(() => {
    setIsLoading(true);
  }, [setIsLoading]);

  const handleCanPlay = useCallback(() => {
    setIsLoading(false);
  }, [setIsLoading]);

  // Save progress periodically
  useEffect(() => {
    if (isPlaying && onProgress) {
      progressIntervalRef.current = setInterval(() => {
        const video = videoRef.current;
        if (video) {
          const currentPos = Math.floor(video.currentTime);
          if (Math.abs(currentPos - lastSavedPositionRef.current) >= PROGRESS_SAVE_INTERVAL) {
            onProgress(currentPos);
            lastSavedPositionRef.current = currentPos;
          }
        }
      }, 5000);
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [isPlaying, onProgress]);

  // Save progress on unmount
  useEffect(() => {
    return () => {
      const video = videoRef.current;
      if (video && video.currentTime > 0 && onProgress) {
        onProgress(Math.floor(video.currentTime));
      }
    };
  }, [onProgress]);

  return {
    videoRef,
    play,
    pause,
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
  };
}

export default useVideoPlayer;
