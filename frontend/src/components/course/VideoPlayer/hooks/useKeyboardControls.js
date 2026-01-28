import { useEffect, useCallback } from 'react';
import { SEEK_AMOUNT, VOLUME_CHANGE_AMOUNT } from '../utils/constants';

/**
 * Keyboard controls hook for video player
 * Provides keyboard event handling for all player shortcuts
 */
export function useKeyboardControls({
  containerRef,
  videoRef,
  togglePlay,
  seek,
  seekRelative,
  changeVolume,
  toggleMute,
  toggleFullscreen,
  togglePiP,
  cycleSpeedUp,
  cycleSpeedDown,
  setShowShortcutsHelp,
  showShortcutsHelp,
  duration,
}) {
  const handleKeyDown = useCallback((e) => {
    // Ignore if typing in an input or if focus is outside container
    if (
      e.target.tagName === 'INPUT' ||
      e.target.tagName === 'TEXTAREA' ||
      !containerRef.current?.contains(document.activeElement)
    ) {
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
        if (videoRef.current) {
          changeVolume(videoRef.current.volume + VOLUME_CHANGE_AMOUNT);
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (videoRef.current) {
          changeVolume(videoRef.current.volume - VOLUME_CHANGE_AMOUNT);
        }
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
      case '9': {
        e.preventDefault();
        const percentage = parseInt(e.key) / 10;
        seek(duration * percentage);
        break;
      }
      default:
        break;
    }
  }, [
    containerRef,
    videoRef,
    togglePlay,
    seek,
    seekRelative,
    changeVolume,
    toggleMute,
    toggleFullscreen,
    togglePiP,
    cycleSpeedUp,
    cycleSpeedDown,
    setShowShortcutsHelp,
    showShortcutsHelp,
    duration,
  ]);

  // Attach keyboard listener
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [containerRef, handleKeyDown]);

  return { handleKeyDown };
}

export default useKeyboardControls;
