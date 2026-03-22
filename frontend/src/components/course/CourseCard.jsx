import React, { memo } from 'react';
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
  Skeleton,
  LinearProgress,
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { formatCurrency, formatDurationHours } from '../../utils/formatters';
import { ROUTES, IMAGES } from '../../utils/constants';
import { getApiBaseUrl } from '../../services/api';
import { useConfig } from '../../store';

/**
 * Course Card component for displaying course information
 */
const CourseCard = memo(function CourseCard({
  course,
  isEnrolled = false,
  progress = 0,
  onEnroll,
  loading = false,
  enrolling = false,
  selectedCountry = 'US',
}) {
  const navigate = useNavigate();
  const { getImage, getCategoryLabel } = useConfig();

  if (loading) {
    return (
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Skeleton variant="rectangular" height={180} animation="wave" />
        <CardContent sx={{ flex: 1 }}>
          <Skeleton variant="text" width="80%" height={32} animation="wave" />
          <Skeleton variant="text" width="100%" animation="wave" />
          <Skeleton variant="text" width="60%" animation="wave" />
        </CardContent>
        <CardActions>
          <Skeleton variant="rectangular" width={100} height={36} animation="wave" />
        </CardActions>
      </Card>
    );
  }

  const handleCardClick = () => {
    navigate(ROUTES.COURSE_DETAIL(course.slug || course.id));
  };

  const handleEnrollClick = (e) => {
    e.stopPropagation();
    navigate(ROUTES.COURSE_DETAIL(course.slug || course.id));
  };

  const isFree = !course.price || course.price === 0;
  const isCompleted = progress >= 100;

  // Construct full image URL from API base URL (prefer thumbnail, fall back to legacy image)
  const imagePath = course.thumbnailImageUrl || course.imageUrl;
  const imageUrl = imagePath
    ? `${getApiBaseUrl()}${imagePath}`
    : getImage('COURSE_PLACEHOLDER', IMAGES.COURSE_PLACEHOLDER);

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
      onClick={handleCardClick}
      tabIndex={0}
      onKeyPress={(e) => e.key === 'Enter' && handleCardClick()}
      role="article"
      aria-label={`Course: ${course.title}`}
    >
      {/* Course Image */}
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height={180}
          image={imageUrl}
          alt={course.title}
          loading="lazy"
          sx={{ objectFit: 'cover' }}
        />
        {isEnrolled && (
          <Chip
            label={isCompleted ? 'Completed' : 'Enrolled'}
            color={isCompleted ? 'success' : 'primary'}
            size="small"
            icon={isCompleted ? <CheckCircleIcon /> : <PlayCircleOutlineIcon />}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
            }}
          />
        )}
        {isFree && !isEnrolled && (
          <Chip
            label="Free"
            color="success"
            size="small"
            sx={{
              position: 'absolute',
              top: 8,
              left: 8,
            }}
          />
        )}
      </Box>

      {/* Progress bar for enrolled courses */}
      {isEnrolled && progress > 0 && (
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{ height: 4 }}
          aria-label={`Course progress: ${progress}%`}
        />
      )}

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

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            mb: 2,
            flex: 1,
          }}
        >
          {course.description}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 'auto' }}>
          {course.durationHours && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <AccessTimeIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {formatDurationHours(course.durationHours)}
              </Typography>
            </Box>
          )}
          {course.categories?.[0] && (
            <Chip label={getCategoryLabel(course.categories[0])} size="small" variant="outlined" />
          )}
        </Box>
      </CardContent>

      {/* Actions */}
      <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
        <Typography variant="h6" color="primary" fontWeight={600}>
          {(() => {
            if (!selectedCountry || selectedCountry === 'IN') {
              return formatCurrency(course.price || 0, 'INR');
            }
            const cp = course.countryPrices?.find((p) => p.countryCode === selectedCountry);
            if (cp) return formatCurrency(cp.amount, cp.currencyCode);
            const usCp = course.countryPrices?.find((p) => p.countryCode === 'US');
            return formatCurrency(usCp ? usCp.amount : course.price || 0, usCp ? usCp.currencyCode : 'INR');
          })()}
        </Typography>
        <Button
          variant="contained"
          size="small"
          onClick={handleEnrollClick}
          disabled={enrolling || isEnrolled}
          aria-busy={enrolling}
        >
          {isEnrolled ? 'Already Enrolled' : (enrolling ? 'Enrolling...' : isFree ? 'Enroll Free' : 'Enroll & Get Certified')}
        </Button>
      </CardActions>
    </Card>
  );
});

export default CourseCard;
