import React from 'react';
import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Typography,
  Box,
  Chip,
  LinearProgress,
} from '@mui/material';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LockIcon from '@mui/icons-material/Lock';
import { formatDuration } from '../../utils/formatters';

/**
 * Video List component with progress indicators
 */
function VideoList({
  videos = [],
  currentVideoId,
  progressMap = {},
  onVideoSelect,
  locked = false,
}) {
  if (!videos || videos.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">No videos available</Typography>
      </Box>
    );
  }

  return (
    <List sx={{ width: '100%', bgcolor: 'background.paper' }} aria-label="Course videos">
      {videos.map((video, index) => {
        const progress = progressMap[video.id];
        const isCompleted = progress?.completed;
        const progressPercent = progress?.lastPositionSeconds
          ? Math.min(100, (progress.lastPositionSeconds / video.durationSeconds) * 100)
          : 0;
        const isCurrent = currentVideoId === video.id;
        const isLocked = locked && index > 0 && !progressMap[videos[index - 1]?.id]?.completed;

        return (
          <Box key={video.id}>
            <ListItemButton
              selected={isCurrent}
              disabled={isLocked}
              onClick={() => !isLocked && onVideoSelect?.(video)}
              sx={{
                borderLeft: isCurrent ? 4 : 0,
                borderColor: 'primary.main',
                '&.Mui-selected': {
                  backgroundColor: 'rgba(79, 102, 114, 0.15)',
                },
              }}
              aria-current={isCurrent ? 'true' : undefined}
            >
              <ListItemIcon>
                {isLocked ? (
                  <LockIcon color="disabled" />
                ) : isCompleted ? (
                  <CheckCircleIcon color="success" />
                ) : (
                  <PlayCircleOutlineIcon color={isCurrent ? 'primary' : 'action'} />
                )}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ minWidth: 24 }}
                    >
                      {index + 1}.
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: isCurrent ? 600 : 400,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {video.title}
                    </Typography>
                  </Box>
                }
                secondary={
                  progressPercent > 0 && !isCompleted ? (
                    <Box sx={{ mt: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={progressPercent}
                        sx={{ height: 4, borderRadius: 2 }}
                      />
                    </Box>
                  ) : null
                }
              />
              <ListItemSecondaryAction>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {isCompleted && (
                    <Chip label="Completed" size="small" color="success" variant="outlined" />
                  )}
                  <Typography variant="body2" color="text.secondary">
                    {formatDuration(video.durationSeconds)}
                  </Typography>
                </Box>
              </ListItemSecondaryAction>
            </ListItemButton>
          </Box>
        );
      })}
    </List>
  );
}

export default VideoList;
