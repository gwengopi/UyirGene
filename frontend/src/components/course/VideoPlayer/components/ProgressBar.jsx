import React, { useCallback, useState } from 'react';
import { Box, Slider, Typography } from '@mui/material';
import { useVideoPlayerContext } from '../VideoPlayerContext';
import { formatTime } from '../utils/videoUtils';

/**
 * Video progress bar with seek functionality and buffer indicator
 */
function ProgressBar({ onSeek }) {
  const { currentTime, duration, buffered } = useVideoPlayerContext();
  const [hoverTime, setHoverTime] = useState(null);
  const [hoverPosition, setHoverPosition] = useState(0);

  const handleChange = useCallback((_, value) => {
    onSeek(value);
  }, [onSeek]);

  const handleMouseMove = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const position = (e.clientX - rect.left) / rect.width;
    const time = position * duration;
    setHoverTime(time);
    setHoverPosition(e.clientX - rect.left);
  }, [duration]);

  const handleMouseLeave = useCallback(() => {
    setHoverTime(null);
  }, []);

  // Calculate buffer percentage
  const bufferPercent = duration > 0 ? (buffered / duration) * 100 : 0;

  return (
    <Box
      sx={{ position: 'relative', width: '100%', py: 1 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Buffer indicator */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: 0,
          height: 4,
          width: `${bufferPercent}%`,
          backgroundColor: 'rgba(255, 255, 255, 0.3)',
          borderRadius: 2,
          transform: 'translateY(-50%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Progress slider */}
      <Slider
        value={currentTime}
        max={duration || 100}
        onChange={handleChange}
        aria-label="Video progress"
        aria-valuetext={`${formatTime(currentTime)} of ${formatTime(duration)}`}
        sx={{
          color: 'primary.main',
          height: 4,
          padding: '13px 0',
          '& .MuiSlider-thumb': {
            width: 12,
            height: 12,
            backgroundColor: 'primary.main',
            transition: 'width 0.2s, height 0.2s',
            '&:hover, &.Mui-focusVisible': {
              boxShadow: '0 0 0 8px rgba(79, 102, 114, 0.16)',
              width: 16,
              height: 16,
            },
            '&.Mui-active': {
              width: 16,
              height: 16,
            },
          },
          '& .MuiSlider-track': {
            backgroundColor: 'primary.main',
            border: 'none',
          },
          '& .MuiSlider-rail': {
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
          },
        }}
      />

      {/* Hover time tooltip */}
      {hoverTime !== null && (
        <Box
          sx={{
            position: 'absolute',
            bottom: '100%',
            left: hoverPosition,
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            px: 1,
            py: 0.5,
            borderRadius: 1,
            pointerEvents: 'none',
            mb: 1,
          }}
        >
          <Typography variant="caption">
            {formatTime(hoverTime)}
          </Typography>
        </Box>
      )}
    </Box>
  );
}

export default ProgressBar;
