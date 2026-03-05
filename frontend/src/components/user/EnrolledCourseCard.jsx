import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Typography,
  Button,
  Box,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import DownloadIcon from '@mui/icons-material/Download';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ProgressTracker from './ProgressTracker';
import { ROUTES, IMAGES } from '../../utils/constants';
import { getApiBaseUrl } from '../../services/api';
import { useConfig } from '../../store';

/**
 * Enrolled Course Card with progress display
 */
function EnrolledCourseCard({
  course,
  progress = 0,
  completedVideos = 0,
  totalVideos = 0,
  onDownloadCertificate,
  certificateAvailable = false,
  onUnenroll,
}) {
  const navigate = useNavigate();
  const { getImage } = useConfig();
  const isCompleted = progress >= 100;
  const [unenrollDialogOpen, setUnenrollDialogOpen] = useState(false);

  // Construct full image URL (prefer thumbnail, fall back to legacy image)
  const imagePath = course.thumbnailImageUrl || course.imageUrl;
  const courseImageUrl = imagePath
    ? `${getApiBaseUrl()}${imagePath}`
    : getImage('COURSE_PLACEHOLDER', IMAGES.COURSE_PLACEHOLDER);

  const handleContinue = () => {
    navigate(ROUTES.COURSE_DETAIL(course.id), { state: { mode: 'learn' } });
  };

  const handleDownloadCertificate = (e) => {
    e.stopPropagation();
    onDownloadCertificate?.(course.id, course.title);
  };

  const handleUnenrollClick = (e) => {
    e.stopPropagation();
    setUnenrollDialogOpen(true);
  };

  const handleConfirmUnenroll = () => {
    setUnenrollDialogOpen(false);
    onUnenroll?.();
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-4px)',
          transition: 'transform 0.2s ease-in-out',
        },
      }}
      onClick={handleContinue}
      tabIndex={0}
      onKeyPress={(e) => e.key === 'Enter' && handleContinue()}
      role="article"
      aria-label={`Enrolled course: ${course.title}`}
    >
      {/* Course Image with status overlay */}
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height={160}
          image={courseImageUrl}
          alt={course.title}
          sx={{ objectFit: 'cover' }}
        />
        <Chip
          label={isCompleted ? 'Completed' : 'In Progress'}
          color={isCompleted ? 'success' : 'primary'}
          size="small"
          icon={isCompleted ? <CheckCircleIcon /> : <PlayCircleOutlineIcon />}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
          }}
        />
      </Box>

      {/* Content */}
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography
          gutterBottom
          variant="h6"
          component="h3"
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            minHeight: 56,
          }}
        >
          {course.title}
        </Typography>

        {/* Progress section */}
        <Box sx={{ mt: 'auto' }}>
          <ProgressTracker
            value={progress}
            label={`${completedVideos} of ${totalVideos} videos`}
            size="medium"
            color={isCompleted ? 'success' : 'primary'}
          />
        </Box>
      </CardContent>

      {/* Actions */}
      <CardActions sx={{ px: 2, pb: 2, flexDirection: 'column', gap: 1 }}>
        <Button
          variant="contained"
          startIcon={<PlayCircleOutlineIcon />}
          onClick={handleContinue}
          fullWidth
        >
          {isCompleted ? 'Review Course' : 'Continue Learning'}
        </Button>
        {certificateAvailable && isCompleted && (
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleDownloadCertificate}
            aria-label="Download certificate"
            fullWidth
          >
            Download Certificate
          </Button>
        )}
        <Button
          variant="text"
          color="error"
          size="small"
          fullWidth
          onClick={handleUnenrollClick}
        >
          Unenroll
        </Button>
      </CardActions>

      {/* Unenroll Confirmation Dialog */}
      <Dialog
        open={unenrollDialogOpen}
        onClose={() => setUnenrollDialogOpen(false)}
        onClick={(e) => e.stopPropagation()}
        aria-labelledby="unenroll-dialog-title"
      >
        <DialogTitle id="unenroll-dialog-title">Unenroll from Course?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to unenroll from "{course.title}"? Your progress will be lost and you may need to pay again if it's a paid course.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUnenrollDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmUnenroll} color="error" variant="contained">
            Unenroll
          </Button>
        </DialogActions>
      </Dialog>

    </Card>
  );
}

export default EnrolledCourseCard;
