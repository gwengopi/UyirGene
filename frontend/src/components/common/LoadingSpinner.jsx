import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

/**
 * Loading spinner with optional text and accessibility support
 */
function LoadingSpinner({
  size = 40,
  text,
  fullScreen = false,
  overlay = false,
  color = 'primary',
}) {
  const content = (
    <Box
      role="status"
      aria-live="polite"
      aria-busy="true"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        p: 3,
      }}
    >
      <CircularProgress size={size} color={color} aria-hidden="true" />
      {text ? (
        <Typography variant="body2" color="text.secondary">
          {text}
        </Typography>
      ) : (
        <span className="visually-hidden">Loading...</span>
      )}
    </Box>
  );

  if (fullScreen) {
    return (
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: overlay ? 'rgba(0, 0, 0, 0.5)' : 'background.default',
          zIndex: 9999,
        }}
      >
        {content}
      </Box>
    );
  }

  if (overlay) {
    return (
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1,
        }}
      >
        {content}
      </Box>
    );
  }

  return content;
}

export default LoadingSpinner;
