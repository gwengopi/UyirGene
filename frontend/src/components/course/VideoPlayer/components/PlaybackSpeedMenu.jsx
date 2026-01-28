import React, { useState, useCallback } from 'react';
import { IconButton, Menu, MenuItem, Typography, Box } from '@mui/material';
import SpeedIcon from '@mui/icons-material/Speed';
import { useVideoPlayerContext } from '../VideoPlayerContext';
import { PLAYBACK_SPEEDS } from '../utils/constants';

/**
 * Playback speed selection menu
 */
function PlaybackSpeedMenu({ onSpeedChange }) {
  const { playbackSpeed } = useVideoPlayerContext();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = useCallback((event) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleSpeedSelect = useCallback((speed) => {
    onSpeedChange(speed);
    handleClose();
  }, [onSpeedChange, handleClose]);

  return (
    <>
      <IconButton
        onClick={handleClick}
        aria-label="Playback speed"
        aria-controls={open ? 'speed-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        sx={{
          color: 'white',
          '&:hover': {
            backgroundColor: 'rgba(79, 102, 114, 0.3)',
          },
        }}
      >
        <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <SpeedIcon />
          {playbackSpeed !== 1 && (
            <Typography
              variant="caption"
              sx={{
                position: 'absolute',
                bottom: -8,
                right: -8,
                fontSize: '0.6rem',
                backgroundColor: 'primary.main',
                borderRadius: '50%',
                width: 16,
                height: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {playbackSpeed}x
            </Typography>
          )}
        </Box>
      </IconButton>

      <Menu
        id="speed-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        slotProps={{
          paper: {
            sx: {
              backgroundColor: 'rgba(30, 30, 30, 0.95)',
              backdropFilter: 'blur(10px)',
              minWidth: 120,
            },
          },
        }}
      >
        {PLAYBACK_SPEEDS.map((speed) => (
          <MenuItem
            key={speed}
            onClick={() => handleSpeedSelect(speed)}
            selected={speed === playbackSpeed}
            sx={{
              justifyContent: 'center',
              '&.Mui-selected': {
                backgroundColor: 'rgba(79, 102, 114, 0.3)',
              },
              '&:hover': {
                backgroundColor: 'rgba(79, 102, 114, 0.2)',
              },
            }}
          >
            <Typography
              variant="body2"
              sx={{
                fontWeight: speed === playbackSpeed ? 600 : 400,
              }}
            >
              {speed === 1 ? 'Normal' : `${speed}x`}
            </Typography>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

export default PlaybackSpeedMenu;
