import React, { useState, useCallback } from 'react';
import { Box, IconButton, Slider } from '@mui/material';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeDownIcon from '@mui/icons-material/VolumeDown';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import VolumeMuteIcon from '@mui/icons-material/VolumeMute';
import { useVideoPlayerContext } from '../VideoPlayerContext';

/**
 * Volume control with mute toggle and slider
 */
function VolumeControl({ onVolumeChange, onToggleMute }) {
  const { volume, isMuted } = useVideoPlayerContext();
  const [showSlider, setShowSlider] = useState(false);

  const handleVolumeChange = useCallback((_, value) => {
    onVolumeChange(value);
  }, [onVolumeChange]);

  // Get appropriate volume icon
  const getVolumeIcon = () => {
    if (isMuted || volume === 0) {
      return <VolumeOffIcon />;
    }
    if (volume < 0.3) {
      return <VolumeMuteIcon />;
    }
    if (volume < 0.7) {
      return <VolumeDownIcon />;
    }
    return <VolumeUpIcon />;
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
      }}
      onMouseEnter={() => setShowSlider(true)}
      onMouseLeave={() => setShowSlider(false)}
    >
      <IconButton
        onClick={onToggleMute}
        aria-label={isMuted ? 'Unmute' : 'Mute'}
        sx={{
          color: 'white',
          '&:hover': {
            backgroundColor: 'rgba(79, 102, 114, 0.3)',
          },
        }}
      >
        {getVolumeIcon()}
      </IconButton>

      <Box
        sx={{
          width: showSlider ? 80 : 0,
          overflow: 'hidden',
          transition: 'width 0.2s ease-in-out',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Slider
          value={isMuted ? 0 : volume}
          min={0}
          max={1}
          step={0.05}
          onChange={handleVolumeChange}
          aria-label="Volume"
          sx={{
            color: 'white',
            width: 70,
            mx: 1,
            '& .MuiSlider-thumb': {
              width: 10,
              height: 10,
              '&:hover, &.Mui-focusVisible': {
                boxShadow: '0 0 0 6px rgba(255, 255, 255, 0.16)',
              },
            },
            '& .MuiSlider-track': {
              height: 3,
            },
            '& .MuiSlider-rail': {
              height: 3,
              backgroundColor: 'rgba(255, 255, 255, 0.3)',
            },
          }}
        />
      </Box>
    </Box>
  );
}

export default VolumeControl;
