import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Typography,
  Box,
  Paper,
  Divider,
  Alert,
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CategoryIcon from '@mui/icons-material/Category';
import { Button, Breadcrumb, LoadingSpinner } from '../components/common';
import { VideoPlayer, VideoList } from '../components/course';
import { ProgressTracker } from '../components/user';
import { courseService, enrollmentService, videoService, certificateService } from '../services';
import { useAuth, useToast } from '../store';
import { formatCurrency, formatDurationHours } from '../utils/formatters';
import { ROUTES } from '../utils/constants';

function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { showSuccess, showError } = useToast();

  const [course, setCourse] = useState(null);
  const [videos, setVideos] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [currentVideo, setCurrentVideo] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  // Load course data
  useEffect(() => {
    const loadCourse = async () => {
      setLoading(true);
      try {
        const courseData = await courseService.getCourse(id);
        setCourse(courseData);

        if (isAuthenticated()) {
          // Check enrollment
          const enrolled = await enrollmentService.getEnrolledCourses();
          const isUserEnrolled = enrolled.some((c) => c.id === parseInt(id));
          setIsEnrolled(isUserEnrolled);

          if (isUserEnrolled) {
            // Load videos and progress
            const videosData = await courseService.getCourseVideos(id);
            setVideos(videosData);

            // Load progress for all videos
            const progress = {};
            for (const video of videosData) {
              const videoProgress = await videoService.getProgress(video.id);
              if (videoProgress) {
                progress[video.id] = videoProgress;
              }
            }
            setProgressMap(progress);

            // Set first incomplete video as current
            const incompleteVideo = videosData.find((v) => !progress[v.id]?.completed);
            setCurrentVideo(incompleteVideo || videosData[0]);
          }
        }
      } catch (error) {
        showError('Failed to load course');
      } finally {
        setLoading(false);
      }
    };

    loadCourse();
  }, [id, isAuthenticated, showError]);

  // Handle enrollment
  const handleEnroll = async () => {
    if (!isAuthenticated()) {
      navigate(ROUTES.LOGIN);
      return;
    }

    setEnrolling(true);
    try {
      const result = await enrollmentService.startEnrollment(id);

      if (result.order) {
        const paymentData = await enrollmentService.processRazorpayPayment({
          orderId: result.order.orderId,
          amount: result.order.amount,
          currency: result.order.currency,
          keyId: result.order.keyId,
          courseName: course?.title,
        });

        await enrollmentService.confirmPayment(id, paymentData);
      }

      setIsEnrolled(true);
      showSuccess('Successfully enrolled!');

      // Load videos after enrollment
      const videosData = await courseService.getCourseVideos(id);
      setVideos(videosData);
      setCurrentVideo(videosData[0]);
    } catch (error) {
      if (error.message !== 'Payment cancelled') {
        showError(error.message || 'Failed to enroll');
      }
    } finally {
      setEnrolling(false);
    }
  };

  // Handle video progress
  const handleVideoProgress = useCallback(
    async (positionSeconds) => {
      if (!currentVideo) return;

      try {
        const progress = await videoService.updateProgress(currentVideo.id, positionSeconds);
        setProgressMap((prev) => ({
          ...prev,
          [currentVideo.id]: progress,
        }));
      } catch (error) {
        console.error('Failed to save progress:', error);
      }
    },
    [currentVideo]
  );

  // Handle video completion
  const handleVideoComplete = useCallback(async () => {
    if (!currentVideo) return;

    try {
      await videoService.updateProgress(currentVideo.id, currentVideo.durationSeconds);
      setProgressMap((prev) => ({
        ...prev,
        [currentVideo.id]: { ...prev[currentVideo.id], completed: true },
      }));

      // Auto-advance to next video
      const currentIndex = videos.findIndex((v) => v.id === currentVideo.id);
      if (currentIndex < videos.length - 1) {
        setCurrentVideo(videos[currentIndex + 1]);
      }

      showSuccess('Video completed!');
    } catch (error) {
      console.error('Failed to mark video complete:', error);
    }
  }, [currentVideo, videos, showSuccess]);

  // Download certificate
  const handleDownloadCertificate = async () => {
    try {
      await certificateService.downloadAndSaveCertificate(id, course?.title);
      showSuccess('Certificate downloaded!');
    } catch (error) {
      showError('Certificate not available yet');
    }
  };

  // Calculate overall progress
  const completedVideos = Object.values(progressMap).filter((p) => p?.completed).length;
  const totalVideos = videos.length;
  const progressPercent = totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0;
  const isCompleted = progressPercent >= 100;

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading course..." />;
  }

  if (!course) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">Course not found</Alert>
      </Container>
    );
  }

  const breadcrumbItems = [
    { label: 'Courses', path: ROUTES.COURSES },
    { label: course.title, path: ROUTES.COURSE_DETAIL(id) },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Breadcrumb items={breadcrumbItems} />

      <Grid container spacing={4}>
        {/* Main content */}
        <Grid item xs={12} md={8}>
          {isEnrolled && currentVideo ? (
            <>
              <VideoPlayer
                src={currentVideo.url}
                title={currentVideo.title}
                initialPosition={progressMap[currentVideo.id]?.lastPositionSeconds || 0}
                onProgress={handleVideoProgress}
                onComplete={handleVideoComplete}
              />
              <Typography variant="h5" sx={{ mt: 2, mb: 1 }} fontWeight={600}>
                {currentVideo.title}
              </Typography>
            </>
          ) : (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                {course.title}
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 3 }}>
                {course.description}
              </Typography>
              {!isEnrolled && (
                <Button variant="contained" size="large" onClick={handleEnroll} loading={enrolling}>
                  {course.price ? `Enroll for ${formatCurrency(course.price)}` : 'Enroll Free'}
                </Button>
              )}
            </Paper>
          )}
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Course Info
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CategoryIcon color="action" />
                <Typography variant="body2">
                  Category: <strong>{course.category || 'General'}</strong>
                </Typography>
              </Box>
              {course.durationHours && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccessTimeIcon color="action" />
                  <Typography variant="body2">
                    Duration: <strong>{formatDurationHours(course.durationHours)}</strong>
                  </Typography>
                </Box>
              )}
              <Divider />
              <Typography variant="h5" color="primary" fontWeight={600}>
                {formatCurrency(course.price)}
              </Typography>
              {!isEnrolled && (
                <Button variant="contained" fullWidth onClick={handleEnroll} loading={enrolling}>
                  {course.price ? 'Enroll Now' : 'Enroll Free'}
                </Button>
              )}
            </Box>
          </Paper>

          {isEnrolled && (
            <>
              {/* Progress */}
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Your Progress
                </Typography>
                <ProgressTracker
                  value={completedVideos}
                  max={totalVideos}
                  label={`${completedVideos} of ${totalVideos} videos completed`}
                  variant="circular"
                  size="medium"
                  color={isCompleted ? 'success' : 'primary'}
                />
                {isCompleted && (
                  <Button
                    variant="outlined"
                    fullWidth
                    sx={{ mt: 2 }}
                    onClick={handleDownloadCertificate}
                  >
                    Download Certificate
                  </Button>
                )}
              </Paper>

              {/* Video list */}
              <Paper>
                <Typography variant="h6" sx={{ p: 2 }}>
                  Course Content
                </Typography>
                <Divider />
                <VideoList
                  videos={videos}
                  currentVideoId={currentVideo?.id}
                  progressMap={progressMap}
                  onVideoSelect={setCurrentVideo}
                />
              </Paper>
            </>
          )}
        </Grid>
      </Grid>
    </Container>
  );
}

export default CourseDetail;
