import React from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import PictureInPictureAltIcon from '@mui/icons-material/PictureInPictureAlt';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { useVideoPlayerContext } from '../VideoPlayerContext';
import ProgressBar from './ProgressBar';
import VolumeControl from './VolumeControl';
import PlaybackSpeedMenu from './PlaybackSpeedMenu';
import { formatTime } from '../utils/videoUtils';
import { isPiPSupported } from '../utils/videoUtils';

/**
 * Complete video control bar
 */
function VideoControls({
  onTogglePlay,
  onSeek,
  onVolumeChange,
  onToggleMute,
  onSpeedChange,
  onToggleFullscreen,
  onTogglePiP,
  onShowHelp,
}) {
  const {
    isPlaying,
    currentTime,
    duration,
    isFullscreen,
    showControls,
  } = useVideoPlayerContext();

  const pipSupported = isPiPSupported();

  return (
    <Box
      sx={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'linear-gradient(transparent, rgba(0, 0, 0, 0.9))',
        p: 2,
        pt: 4,
        opacity: showControls ? 1 : 0,
        transition: 'opacity 0.3s ease-in-out',
        pointerEvents: showControls ? 'auto' : 'none',
      }}
    >
      {/* Progress bar */}
      <ProgressBar onSeek={onSeek} />

      {/* Controls row */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          mt: 1,
        }}
      >
        {/* Play/Pause */}
        <IconButton
          onClick={onTogglePlay}
          aria-label={isPlaying ? 'Pause' : 'Play'}
          sx={{
            color: 'white',
            '&:hover': {
              backgroundColor: 'rgba(79, 102, 114, 0.3)',
            },
          }}
        >
          {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
        </IconButton>

        {/* Volume control */}
        <VolumeControl
          onVolumeChange={onVolumeChange}
          onToggleMute={onToggleMute}
        />

        {/* Time display */}
        <Typography
          variant="body2"
          sx={{
            color: 'white',
            minWidth: 100,
            textAlign: 'center',
            fontVariantNumeric: 'tabular-nums',
            fontSize: '0.875rem',
          }}
        >
          {formatTime(currentTime)} / {formatTime(duration)}
        </Typography>

        {/* Spacer */}
        <Box sx={{ flex: 1 }} />

        {/* Playback speed */}
        <PlaybackSpeedMenu onSpeedChange={onSpeedChange} />

        {/* Picture-in-Picture */}
        {pipSupported && (
          <IconButton
            onClick={onTogglePiP}
            aria-label="Picture in Picture"
            sx={{
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(79, 102, 114, 0.3)',
              },
            }}
          >
            <PictureInPictureAltIcon />
          </IconButton>
        )}

        {/* Keyboard shortcuts help */}
        <IconButton
          onClick={onShowHelp}
          aria-label="Keyboard shortcuts"
          sx={{
            color: 'white',
            '&:hover': {
              backgroundColor: 'rgba(79, 102, 114, 0.3)',
            },
          }}
        >
          <HelpOutlineIcon />
        </IconButton>

        {/* Fullscreen */}
        <IconButton
          onClick={onToggleFullscreen}
          aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          sx={{
            color: 'white',
            '&:hover': {
              backgroundColor: 'rgba(79, 102, 114, 0.3)',
            },
          }}
        >
          {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
        </IconButton>
      </Box>
    </Box>
  );
}

export default VideoControls;
