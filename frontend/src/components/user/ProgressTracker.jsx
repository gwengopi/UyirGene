import React from 'react';
import {
  Box,
  Typography,
  LinearProgress,
  CircularProgress,
} from '@mui/material';

/**
 * Progress Tracker component with visual indicators
 */
function ProgressTracker({
  value = 0,
  max = 100,
  label,
  showPercentage = true,
  variant = 'linear', // 'linear' or 'circular'
  size = 'medium', // 'small', 'medium', 'large'
  color = 'primary',
}) {
  const percentage = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;

  const circularSizes = {
    small: 60,
    medium: 100,
    large: 140,
  };

  const circularThickness = {
    small: 4,
    medium: 6,
    large: 8,
  };

  if (variant === 'circular') {
    const circularSize = circularSizes[size];
    const thickness = circularThickness[size];

    return (
      <Box
        sx={{
          position: 'relative',
          display: 'inline-flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
          {/* Background circle */}
          <CircularProgress
            variant="determinate"
            value={100}
            size={circularSize}
            thickness={thickness}
            sx={{ color: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }}
          />
          {/* Progress circle */}
          <CircularProgress
            variant="determinate"
            value={percentage}
            size={circularSize}
            thickness={thickness}
            color={color}
            sx={{
              position: 'absolute',
              left: 0,
            }}
          />
          {/* Center content */}
          <Box
            sx={{
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              position: 'absolute',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {showPercentage && (
              <Typography
                variant={size === 'small' ? 'body2' : 'h6'}
                fontWeight={600}
              >
                {percentage}%
              </Typography>
            )}
          </Box>
        </Box>
        {label && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {label}
          </Typography>
        )}
      </Box>
    );
  }

  // Linear variant
  return (
    <Box sx={{ width: '100%' }}>
      {(label || showPercentage) && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          {label && (
            <Typography variant="body2" color="text.secondary">
              {label}
            </Typography>
          )}
          {showPercentage && (
            <Typography variant="body2" fontWeight={600}>
              {percentage}%
            </Typography>
          )}
        </Box>
      )}
      <LinearProgress
        variant="determinate"
        value={percentage}
        color={color}
        sx={{
          height: size === 'small' ? 4 : size === 'large' ? 12 : 8,
          borderRadius: 1,
          backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        }}
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label || 'Progress'}
      />
    </Box>
  );
}

export default ProgressTracker;
