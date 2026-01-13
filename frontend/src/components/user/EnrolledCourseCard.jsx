import React from 'react';
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
} from '@mui/material';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import DownloadIcon from '@mui/icons-material/Download';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ProgressTracker from './ProgressTracker';
import { ROUTES } from '../../utils/constants';

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
}) {
  const navigate = useNavigate();
  const isCompleted = progress >= 100;

  const handleContinue = () => {
    navigate(ROUTES.COURSE_DETAIL(course.id));
  };

  const handleDownloadCertificate = (e) => {
    e.stopPropagation();
    onDownloadCertificate?.(course.id, course.title);
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
          image={course.imageUrl || '/placeholder-course.jpg'}
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
      </CardActions>
    </Card>
  );
}

export default EnrolledCourseCard;
