import { useCallback, useEffect } from 'react';
import { useVideoPlayerContext } from '../VideoPlayerContext';
import { isPiPSupported } from '../utils/videoUtils';

/**
 * Picture-in-Picture API wrapper hook
 */
export function usePictureInPicture(videoRef) {
  const { isPiP, setIsPiP } = useVideoPlayerContext();

  // Enter PiP mode
  const enterPiP = useCallback(async () => {
    const video = videoRef.current;
    if (!video || !isPiPSupported()) return;

    try {
      await video.requestPictureInPicture();
    } catch (error) {
      console.error('Failed to enter Picture-in-Picture:', error);
    }
  }, [videoRef]);

  // Exit PiP mode
  const exitPiP = useCallback(async () => {
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      }
    } catch (error) {
      console.error('Failed to exit Picture-in-Picture:', error);
    }
  }, []);

  // Toggle PiP mode
  const togglePiP = useCallback(() => {
    if (isPiP) {
      exitPiP();
    } else {
      enterPiP();
    }
  }, [isPiP, enterPiP, exitPiP]);

  // Listen for PiP changes
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleEnterPiP = () => {
      setIsPiP(true);
    };

    const handleLeavePiP = () => {
      setIsPiP(false);
    };

    video.addEventListener('enterpictureinpicture', handleEnterPiP);
    video.addEventListener('leavepictureinpicture', handleLeavePiP);

    return () => {
      video.removeEventListener('enterpictureinpicture', handleEnterPiP);
      video.removeEventListener('leavepictureinpicture', handleLeavePiP);
    };
  }, [videoRef, setIsPiP]);

  return {
    isPiP,
    enterPiP,
    exitPiP,
    togglePiP,
    isSupported: isPiPSupported(),
  };
}

export default usePictureInPicture;
