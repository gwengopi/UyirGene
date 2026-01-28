import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, LinearProgress } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ReplayIcon from '@mui/icons-material/Replay';
import { formatTime } from '../utils/videoUtils';
import { RESUME_PROMPT_TIMEOUT } from '../utils/constants';

/**
 * Resume playback prompt dialog
 * Shows when video has a saved position > 30 seconds
 */
function ResumePrompt({ open, position, onResume, onStartOver }) {
  const [progress, setProgress] = useState(100);

  // Auto-dismiss countdown
  useEffect(() => {
    if (!open) {
      setProgress(100);
      return;
    }

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / RESUME_PROMPT_TIMEOUT) * 100);
      setProgress(remaining);

      if (remaining === 0) {
        clearInterval(interval);
        onResume();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [open, onResume]);

  if (!open) return null;

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
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        zIndex: 20,
      }}
    >
      <Box
        sx={{
          backgroundColor: 'background.paper',
          borderRadius: 2,
          p: 3,
          maxWidth: 400,
          width: '90%',
          textAlign: 'center',
        }}
      >
        <Typography variant="h6" gutterBottom>
          Resume Playback?
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          You were at <strong>{formatTime(position)}</strong>
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 2 }}>
          <Button
            variant="contained"
            startIcon={<PlayArrowIcon />}
            onClick={onResume}
            sx={{
              backgroundColor: 'primary.main',
              '&:hover': {
                backgroundColor: 'primary.dark',
              },
            }}
          >
            Resume
          </Button>
          <Button
            variant="outlined"
            startIcon={<ReplayIcon />}
            onClick={onStartOver}
          >
            Start Over
          </Button>
        </Box>

        {/* Auto-resume progress */}
        <Box sx={{ width: '100%' }}>
          <Typography variant="caption" color="text.secondary">
            Auto-resuming in {Math.ceil((progress / 100) * (RESUME_PROMPT_TIMEOUT / 1000))}s
          </Typography>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              mt: 0.5,
              height: 4,
              borderRadius: 2,
              backgroundColor: 'action.hover',
              '& .MuiLinearProgress-bar': {
                backgroundColor: 'primary.main',
              },
            }}
          />
        </Box>
      </Box>
    </Box>
  );
}

export default ResumePrompt;
