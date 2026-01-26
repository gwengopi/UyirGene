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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CategoryIcon from '@mui/icons-material/Category';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { Button, Breadcrumb, LoadingSpinner } from '../components/common';
import { VideoPlayer, VideoList } from '../components/course';
import { ProgressTracker } from '../components/user';
import { courseService, enrollmentService, videoService, certificateService } from '../services';
import { useAuth, useToast } from '../store';
import { formatCurrency, formatDurationHours } from '../utils/formatters';
import { ROUTES, IMAGES } from '../utils/constants';

function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { showSuccess, showError } = useToast();

  const [course, setCourse] = useState(null);
  const [videos, setVideos] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [currentVideo, setCurrentVideo] = useState(null);
  const [currentVideoUrl, setCurrentVideoUrl] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollmentStatus, setEnrollmentStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [unenrollDialogOpen, setUnenrollDialogOpen] = useState(false);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [certificateErrorOpen, setCertificateErrorOpen] = useState(false);
  const [certificateError, setCertificateError] = useState('');
  const [enrollmentErrorOpen, setEnrollmentErrorOpen] = useState(false);
  const [enrollmentError, setEnrollmentError] = useState('');

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
          const enrollmentData = enrolled.find((c) => {
            const courseObj = c.course || c;
            return courseObj.id === parseInt(id);
          });
          const isUserEnrolled = !!enrollmentData;
          setIsEnrolled(isUserEnrolled);
          if (enrollmentData) {
            setEnrollmentStatus(enrollmentData.status);
          }

          if (isUserEnrolled) {
            // Load videos and progress
            const videosData = await courseService.getCourseVideos(id);
            setVideos(videosData);

            // Load progress for all videos - handle errors gracefully
            const progress = {};
            try {
              for (const video of videosData) {
                const videoProgress = await videoService.getProgress(video.id);
                if (videoProgress) {
                  progress[video.id] = videoProgress;
                }
              }
            } catch (progressError) {
              console.warn('Failed to load some video progress:', progressError);
              // Continue without progress data - user can still watch videos
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

  // Decrypt video URL when current video changes
  useEffect(() => {
    const decryptVideoUrl = async () => {
      if (!currentVideo?.encryptedUrl) {
        setCurrentVideoUrl(null);
        return;
      }

      try {
        const decryptedUrl = await videoService.decryptUrl(currentVideo.encryptedUrl);
        setCurrentVideoUrl(decryptedUrl);
      } catch (error) {
        console.error('Failed to decrypt video URL:', error);
        showError('Failed to load video');
        setCurrentVideoUrl(null);
      }
    };

    decryptVideoUrl();
  }, [currentVideo, showError]);

  // Handle enrollment
  const handleEnroll = async () => {
    if (!isAuthenticated()) {
      navigate(ROUTES.REGISTER);
      return;
    }

    // Check if already enrolled
    if (isEnrolled) {
      setEnrollmentError('You are already enrolled in this course');
      setEnrollmentErrorOpen(true);
      return;
    }

    setEnrolling(true);
    try {
      const result = await enrollmentService.startEnrollment(id);

      // Detect order shape: backend may return order object directly or wrapped
      const order = result && (result.order ? result.order : result.orderId ? result : null);
      if (order) {
        navigate(ROUTES.PAYMENT, {
          state: {
            courseId: id,
            courseName: course?.title,
            order,
          },
        });
        return;
      }

      // Free course was enrolled immediately
      setIsEnrolled(true);
      showSuccess('Successfully enrolled!');

      // Load videos after enrollment
      const videosData = await courseService.getCourseVideos(id);
      setVideos(videosData);
      setCurrentVideo(videosData[0]);
    } catch (error) {
      if (error.message !== 'Payment cancelled') {
        setEnrollmentError(error.message || 'Failed to enroll');
        setEnrollmentErrorOpen(true);
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
      // Check if it's a result not published error
      if (error.response?.status === 403) {
        setCertificateError('Results not yet published. Certificate download will be available after 48 hours of exam completion.');
      } else if (error.response?.status === 404) {
        setCertificateError('Certificate not found. Please wait for admin to generate your certificate.');
      } else {
        setCertificateError(error.message || 'Certificate not available yet');
      }
      setCertificateErrorOpen(true);
    }
  };

  // Handle unenroll
  const handleUnenroll = async () => {
    try {
      await enrollmentService.unenroll(id);
      showSuccess('You have been unenrolled from this course');
      setIsEnrolled(false);
      setEnrollmentStatus(null);
      setVideos([]);
      setCurrentVideo(null);
      setProgressMap({});
      setUnenrollDialogOpen(false);
    } catch (error) {
      showError('Failed to unenroll');
    }
  };

  // Handle mark complete
  const handleMarkComplete = async () => {
    try {
      await enrollmentService.markComplete(id);
      showSuccess('Course marked as completed! You can now download your certificate.');
      setEnrollmentStatus('COMPLETED');
      setCompleteDialogOpen(false);
    } catch (error) {
      showError('Failed to mark course as complete');
    }
  };

  // Calculate overall progress
  const completedVideos = Object.values(progressMap).filter((p) => p?.completed).length;
  const totalVideos = videos.length;
  const progressPercent = totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0;
  const isCompleted = progressPercent >= 100 || enrollmentStatus === 'COMPLETED';

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
          {isEnrolled && currentVideo && currentVideoUrl ? (
            <>
              <VideoPlayer
                src={currentVideoUrl}
                title={currentVideo.title}
                initialPosition={progressMap[currentVideo.id]?.lastPositionSeconds || 0}
                onProgress={handleVideoProgress}
                onComplete={handleVideoComplete}
              />
              <Typography variant="h5" sx={{ mt: 2, mb: 1 }} fontWeight={600}>
                {currentVideo.title}
              </Typography>
            </>
          ) : isEnrolled && currentVideo && !currentVideoUrl ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">Loading video...</Typography>
            </Paper>
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
              <Button 
                variant="contained" 
                fullWidth 
                onClick={handleEnroll} 
                loading={enrolling}
                disabled={isEnrolled}
              >
                {isEnrolled ? 'Already Enrolled' : (course.price ? 'Enroll Now' : 'Enroll Free')}
              </Button>
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

                {/* Course Actions */}
                <Box sx={{ mt: 2, display: 'flex', gap: 1, flexDirection: 'column' }}>
                  {!isCompleted && (
                    <Button
                      variant="outlined"
                      color="success"
                      fullWidth
                      startIcon={<CheckCircleIcon />}
                      onClick={() => setCompleteDialogOpen(true)}
                    >
                      Mark as Complete
                    </Button>
                  )}
                  <Button
                    variant="text"
                    color="error"
                    fullWidth
                    startIcon={<ExitToAppIcon />}
                    onClick={() => setUnenrollDialogOpen(true)}
                  >
                    Unenroll from Course
                  </Button>
                </Box>
              </Paper>

              {/* Test/Assessment Link */}
              {course.testLink && (
                <Paper sx={{ p: 3, mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AssignmentIcon color="primary" />
                      Course Assessment
                    </Box>
                  </Typography>
                  {course.testDescription && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {course.testDescription}
                    </Typography>
                  )}
                  <Button
                    variant="contained"
                    fullWidth
                    href={course.testLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    startIcon={<AssignmentIcon />}
                  >
                    Take Assessment
                  </Button>
                </Paper>
              )}

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

      {/* Unenroll Confirmation Dialog */}
      <Dialog
        open={unenrollDialogOpen}
        onClose={() => setUnenrollDialogOpen(false)}
        aria-labelledby="unenroll-dialog-title"
      >
        <DialogTitle id="unenroll-dialog-title">Unenroll from Course?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to unenroll from "{course?.title}"? Your progress will be lost and you may need to pay again if it's a paid course.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUnenrollDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleUnenroll} color="error" variant="contained">
            Unenroll
          </Button>
        </DialogActions>
      </Dialog>

      {/* Mark Complete Confirmation Dialog */}
      <Dialog
        open={completeDialogOpen}
        onClose={() => setCompleteDialogOpen(false)}
        aria-labelledby="complete-dialog-title"
      >
        <DialogTitle id="complete-dialog-title">Mark Course as Complete?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to mark "{course?.title}" as complete? This will make you eligible for a certificate.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCompleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleMarkComplete} color="success" variant="contained">
            Mark Complete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Certificate Error Dialog */}
      <Dialog
        open={certificateErrorOpen}
        onClose={() => setCertificateErrorOpen(false)}
        aria-labelledby="certificate-error-title"
      >
        <DialogTitle id="certificate-error-title">Certificate Download</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {certificateError}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCertificateErrorOpen(false)} variant="contained">
            OK
          </Button>
        </DialogActions>
      </Dialog>

      {/* Enrollment Error Dialog */}
      <Dialog
        open={enrollmentErrorOpen}
        onClose={() => setEnrollmentErrorOpen(false)}
        aria-labelledby="enrollment-error-title"
      >
        <DialogTitle id="enrollment-error-title">Enrollment Error</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {enrollmentError}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEnrollmentErrorOpen(false)} variant="contained">
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default CourseDetail;
