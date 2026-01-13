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
  onMarkComplete,
}) {
  const navigate = useNavigate();
  const isCompleted = progress >= 100;
  const [unenrollDialogOpen, setUnenrollDialogOpen] = useState(false);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);

  const handleContinue = () => {
    navigate(ROUTES.COURSE_DETAIL(course.id));
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

  const handleCompleteClick = (e) => {
    e.stopPropagation();
    setCompleteDialogOpen(true);
  };

  const handleConfirmComplete = () => {
    setCompleteDialogOpen(false);
    onMarkComplete?.();
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
          image={course.imageUrl || IMAGES.COURSE_PLACEHOLDER}
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
      <CardActions sx={{ px: 2, pb: 2, gap: 1 }}>
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
          >
            Certificate
          </Button>
        )}
        {/* User actions: Mark Complete / Unenroll */}
        {!isCompleted && (
          <Button
            variant="outlined"
            color="success"
            size="small"
            onClick={handleCompleteClick}
          >
            Complete
          </Button>
        )}
        <Button
          variant="text"
          color="error"
          size="small"
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

      {/* Mark Complete Confirmation Dialog */}
      <Dialog
        open={completeDialogOpen}
        onClose={() => setCompleteDialogOpen(false)}
        onClick={(e) => e.stopPropagation()}
        aria-labelledby="complete-dialog-title"
      >
        <DialogTitle id="complete-dialog-title">Mark Course as Complete?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to mark "{course.title}" as complete? This will make you eligible for a certificate.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCompleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmComplete} color="success" variant="contained">
            Mark Complete
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}

export default EnrolledCourseCard;
