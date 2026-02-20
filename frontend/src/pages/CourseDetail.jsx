import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
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
  TextField,
  Autocomplete,
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CategoryIcon from '@mui/icons-material/Category';
import ComputerIcon from '@mui/icons-material/Computer';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import AssignmentIcon from '@mui/icons-material/Assignment';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PeopleIcon from '@mui/icons-material/People';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ScheduleIcon from '@mui/icons-material/Schedule';
import QuizIcon from '@mui/icons-material/Quiz';
import { Button, Breadcrumb, LoadingSpinner, SEO } from '../components/common';
import { courseSchema } from '../components/common/SEO';
import { VideoPlayer, VideoList } from '../components/course';
import { ProgressTracker } from '../components/user';
import { courseService, enrollmentService, videoService, certificateService } from '../services';
import { useAuth, useToast } from '../store';
import { formatCurrency, formatDurationHours } from '../utils/formatters';
import { ROUTES, IMAGES, SUPPORTED_COUNTRIES } from '../utils/constants';
import { getApiBaseUrl } from '../services/api';

const COURSE_TYPE_LABELS = {
  SELF_PACED: 'Self-Paced Learning',
  LIVE_ONLINE: 'Live Virtual Classroom',
  CLASSROOM: 'In-Person Classroom',
};

function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const { showSuccess, showError } = useToast();

  // Learn mode: only show video player when navigated from My Courses page
  const [learnMode, setLearnMode] = useState(location.state?.mode === 'learn');

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
  const [certificateErrorOpen, setCertificateErrorOpen] = useState(false);
  const [certificateError, setCertificateError] = useState('');
  const [enrollmentErrorOpen, setEnrollmentErrorOpen] = useState(false);
  const [enrollmentError, setEnrollmentError] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('US');

  // Resolve price and currency based on selected country
  const hasCountryPrices = course?.countryPrices && course.countryPrices.length > 0;
  const getDisplayPrice = () => {
    if (!course) return { amount: null, currency: 'USD' };
    if (selectedCountry === 'IN') return { amount: course.price, currency: 'INR' };
    const cp = course.countryPrices?.find(p => p.countryCode === selectedCountry);
    if (cp) return { amount: cp.amount, currency: cp.currencyCode };
    // Fallback: check if US price exists, otherwise show INR base price
    const usCp = course.countryPrices?.find(p => p.countryCode === 'US');
    if (usCp) return { amount: usCp.amount, currency: usCp.currencyCode };
    return { amount: course.price, currency: 'INR' };
  };
  const displayPrice = getDisplayPrice();

  // Load course data
  useEffect(() => {
    const loadCourse = async () => {
      setLoading(true);
      try {
        const courseData = await courseService.getCourse(id);
        setCourse(courseData);

        if (isAuthenticated()) {
          try {
            // Check enrollment
            const enrolled = await enrollmentService.getEnrolledCourses();
            const enrollmentData = enrolled.find((c) => {
              const courseObj = c.course || c;
              return courseObj.id === parseInt(id);
            });
            // Only consider as enrolled if status is ENROLLED or COMPLETED (not PENDING)
            const status = enrollmentData?.status;
            const isUserEnrolled = !!enrollmentData && (status === 'ENROLLED' || status === 'COMPLETED');
            setIsEnrolled(isUserEnrolled);
            if (enrollmentData) {
              setEnrollmentStatus(status);
            }

            if (isUserEnrolled) {
              // Load videos and progress
              const videosData = await courseService.getCourseVideos(id);
              setVideos(videosData);

              // Load progress for all videos in parallel
              const progress = await videoService.getMultipleProgress(
                videosData.map((v) => v.id)
              );
              setProgressMap(progress);

              // Set first incomplete video as current
              const incompleteVideo = videosData.find((v) => !progress[v.id]?.completed);
              setCurrentVideo(incompleteVideo || videosData[0]);
            }
          } catch (enrollmentError) {
            // Handle auth errors gracefully - user can still view course info
            if (enrollmentError.response?.status === 401) {
              console.warn('Session expired while loading enrollment data');
              // Don't show error - user can still view course details and re-login to enroll
            } else {
              console.warn('Failed to load enrollment data:', enrollmentError);
            }
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

    // Prevent enrollment while still loading enrollment status
    if (loading) {
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
      const result = await enrollmentService.startEnrollment(id, selectedCountry);

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
      if (error.message === 'Payment cancelled') {
        // User cancelled - no error message needed
      } else if (error.response?.status === 401) {
        setEnrollmentError('Session expired. Please login again to enroll.');
        setEnrollmentErrorOpen(true);
      } else {
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
      await videoService.updateProgress(currentVideo.id, currentVideo.durationSeconds || 0, true);
      const newProgressMap = {
        ...progressMap,
        [currentVideo.id]: { ...progressMap[currentVideo.id], completed: true },
      };
      setProgressMap(newProgressMap);

      // Check if all videos are now completed
      const allDone = videos.every((v) => newProgressMap[v.id]?.completed);
      if (allDone) {
        setEnrollmentStatus('COMPLETED');
        showSuccess('Course completed! All videos finished.');
      } else {
        showSuccess('Video completed!');
      }

      // Auto-advance to next video
      const currentIndex = videos.findIndex((v) => v.id === currentVideo.id);
      if (currentIndex < videos.length - 1) {
        setCurrentVideo(videos[currentIndex + 1]);
      }
    } catch (error) {
      console.error('Failed to mark video complete:', error);
    }
  }, [currentVideo, videos, progressMap, showSuccess]);

  // Download certificate
  const handleDownloadCertificate = async () => {
    try {
      await certificateService.downloadAndSaveCertificate(id, course?.title);
      showSuccess('Certificate downloaded!');
    } catch (error) {
      // Check if it's a result not published error
      if (error.response?.status === 403) {
        setCertificateError('The certificate will be issued within 24–48 hours following the completion of the examination.');
      } else if (error.response?.status === 404) {
        setCertificateError('The certificate will be issued within 24–48 hours following the completion of the examination.');
      } else {
        setCertificateError('The certificate will be issued within 24–48 hours following the completion of the examination.');
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
      {course && (
        <SEO
          title={course.title}
          description={course.shortDescription || course.description?.substring(0, 160)}
          path={`/courses/${id}`}
          image={course.thumbnailImage ? `${getApiBaseUrl()}/api/courses/${id}/thumbnail` : undefined}
          structuredData={courseSchema(course)}
        />
      )}
      <Breadcrumb items={breadcrumbItems} />

      <Grid container spacing={4}>
        {/* Main content */}
        <Grid item xs={12} md={8}>
          {isEnrolled && learnMode && currentVideo && currentVideoUrl ? (
            <>
              <VideoPlayer
                src={currentVideoUrl}
                title={currentVideo.title}
                initialPosition={progressMap[currentVideo.id]?.lastPositionSeconds || 0}
                onProgress={handleVideoProgress}
                onComplete={handleVideoComplete}
                userEmail={user?.email}
              />
              <Typography variant="h5" sx={{ mt: 2, mb: 1 }} fontWeight={600}>
                {currentVideo.title}
              </Typography>
            </>
          ) : isEnrolled && learnMode && currentVideo && !currentVideoUrl ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">Loading video...</Typography>
            </Paper>
          ) : (
            <Paper sx={{ overflow: 'hidden' }}>
              {(() => {
                const imgPath = course.descriptionImageUrl || course.thumbnailImageUrl || course.imageUrl;
                return imgPath ? (
                  <Box
                    component="img"
                    src={`${getApiBaseUrl()}${imgPath}`}
                    alt={course.title}
                    sx={{
                      width: '100%',
                      maxHeight: 400,
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                ) : null;
              })()}
              <Box sx={{ p: 4 }}>
                <Typography variant="h5" gutterBottom fontWeight={600}>
                  {course.title}
                </Typography>

                {/* Overview */}
                {course.description && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom fontWeight={600} color="primary">
                      Overview
                    </Typography>
                    <Typography color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                      {course.description}
                    </Typography>
                  </Box>
                )}

                {/* Key Components */}
                {course.keyComponents && course.keyComponents.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Divider sx={{ mb: 2 }} />
                    <Typography variant="h6" gutterBottom fontWeight={600} color="primary">
                      Key Components
                    </Typography>
                    {course.keyComponents.map((comp, idx) => (
                      <Box key={idx} sx={{ mb: 2 }}>
                        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 0.5 }}>
                          {comp.title}
                        </Typography>
                        {comp.points && comp.points.length > 0 && (
                          <Box component="ul" sx={{ pl: 0, listStyle: 'none', m: 0 }}>
                            {comp.points.map((point, pIdx) => (
                              <Box
                                component="li"
                                key={pIdx}
                                sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 0.5 }}
                              >
                                <CheckCircleOutlineIcon sx={{ fontSize: 18, color: 'success.main', mt: 0.3, flexShrink: 0 }} />
                                <Typography variant="body2" color="text.secondary">
                                  {point}
                                </Typography>
                              </Box>
                            ))}
                          </Box>
                        )}
                      </Box>
                    ))}
                  </Box>
                )}

                {/* Target Audience */}
                {course.targetAudience && (
                  <Box sx={{ mb: 3 }}>
                    <Divider sx={{ mb: 2 }} />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <PeopleIcon color="primary" />
                      <Typography variant="h6" fontWeight={600} color="primary">
                        Target Audience
                      </Typography>
                    </Box>
                    <Typography color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                      {course.targetAudience}
                    </Typography>
                  </Box>
                )}

                {/* Assessment */}
                {course.assessment && (
                  <Box sx={{ mb: 3 }}>
                    <Divider sx={{ mb: 2 }} />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <AssignmentIcon color="primary" />
                      <Typography variant="h6" fontWeight={600} color="primary">
                        Assessment
                      </Typography>
                    </Box>
                    <Typography color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                      {course.assessment}
                    </Typography>
                  </Box>
                )}

                {/* Outcome */}
                {course.outcome && (
                  <Box sx={{ mb: 3 }}>
                    <Divider sx={{ mb: 2 }} />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <EmojiEventsIcon color="primary" />
                      <Typography variant="h6" fontWeight={600} color="primary">
                        Outcome
                      </Typography>
                    </Box>
                    <Typography color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                      {course.outcome}
                    </Typography>
                  </Box>
                )}

                {/* Course Duration */}
                {course.courseDurationText && (
                  <Box sx={{ mb: 3 }}>
                    <Divider sx={{ mb: 2 }} />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <ScheduleIcon color="primary" />
                      <Typography variant="h6" fontWeight={600} color="primary">
                        Course Duration
                      </Typography>
                    </Box>
                    <Typography color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                      {course.courseDurationText}
                    </Typography>
                  </Box>
                )}

                {/* Exam Details */}
                {course.examDetails && course.examDetails.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Divider sx={{ mb: 2 }} />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <QuizIcon color="primary" />
                      <Typography variant="h6" fontWeight={600} color="primary">
                        Exam Details
                      </Typography>
                    </Box>
                    <Box component="ul" sx={{ pl: 0, listStyle: 'none', m: 0 }}>
                      {course.examDetails.map((detail, idx) => (
                        <Box
                          component="li"
                          key={idx}
                          sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 0.5 }}
                        >
                          <CheckCircleOutlineIcon sx={{ fontSize: 18, color: 'success.main', mt: 0.3, flexShrink: 0 }} />
                          <Typography variant="body2" color="text.secondary">
                            {detail}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}

                {/* Enroll / Continue buttons */}
                <Box sx={{ textAlign: 'center', mt: 4 }}>
                  {!isEnrolled && (
                    <Button variant="contained" size="large" onClick={handleEnroll} loading={enrolling} disabled={loading}>
                      {displayPrice.amount ? `Enroll for ${formatCurrency(displayPrice.amount, displayPrice.currency)}` : 'Enroll Free'}
                    </Button>
                  )}
                  {isEnrolled && !learnMode && (
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<ExitToAppIcon sx={{ transform: 'rotate(180deg)' }} />}
                      onClick={() => setLearnMode(true)}
                    >
                      Continue Learning
                    </Button>
                  )}
                </Box>
              </Box>
            </Paper>
          )}
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {isEnrolled && learnMode ? (
            <>
              {/* Course Content - top when enrolled in learn mode */}
              <Paper sx={{ mb: 3 }}>
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
              {course.testLink && (() => { try { const u = new URL(course.testLink); return u.protocol === 'http:' || u.protocol === 'https:'; } catch { return false; } })() && (
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
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mt: 2 }}>
                    <InfoOutlinedIcon sx={{ fontSize: 18, color: 'text.secondary', mt: 0.2 }} />
                    <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                      After completion of the exam, you can download your certificate. The certificate will be issued within 24–48 hours.
                    </Typography>
                  </Box>
                </Paper>
              )}
            </>
          ) : null}

          {/* Course Info - always shown, at bottom when enrolled */}
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
              {course.courseType && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ComputerIcon color="action" />
                  <Typography variant="body2">
                    Delivery Mode: <strong>{COURSE_TYPE_LABELS[course.courseType] || course.courseType}</strong>
                  </Typography>
                </Box>
              )}
              {course.durationHours && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccessTimeIcon color="action" />
                  <Typography variant="body2">
                    Duration: <strong>{formatDurationHours(course.durationHours)}</strong>
                  </Typography>
                </Box>
              )}
              <Divider />
              {hasCountryPrices && (() => {
                const countryOptions = SUPPORTED_COUNTRIES.filter(
                  c => c.code === 'IN' || course.countryPrices?.some(cp => cp.countryCode === c.code)
                );
                const selectedOption = countryOptions.find(c => c.code === selectedCountry) || countryOptions[0];
                return (
                  <Autocomplete
                    options={countryOptions}
                    getOptionLabel={(option) => `${option.name} (${option.symbol})`}
                    value={selectedOption}
                    onChange={(_, newValue) => {
                      if (newValue) setSelectedCountry(newValue.code);
                    }}
                    renderInput={(params) => (
                      <TextField {...params} label="Select your country" size="small" />
                    )}
                    isOptionEqualToValue={(option, value) => option.code === value?.code}
                    disableClearable
                    fullWidth
                    size="small"
                    sx={{ mb: 1 }}
                  />
                );
              })()}
              <Typography variant="h5" color="primary" fontWeight={600}>
                {formatCurrency(displayPrice.amount, displayPrice.currency)}
              </Typography>
              <Button
                variant="contained"
                fullWidth
                onClick={handleEnroll}
                loading={enrolling}
                disabled={isEnrolled || loading}
              >
                {isEnrolled ? 'Already Enrolled' : (displayPrice.amount ? 'Enroll & Get Certified' : 'Enroll Free')}
              </Button>
            </Box>
          </Paper>
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
