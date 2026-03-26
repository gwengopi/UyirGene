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
  Chip,
  CircularProgress,
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
import { VideoPlayer, VideoList, ManualSection, EnrollmentUpsellDialog } from '../components/course';
import { getPublishedBundlesByCategory, startMultiBundleEnrollment } from '../services/bundleService';
import { ProgressTracker } from '../components/user';
import { courseService, enrollmentService, videoService, certificateService } from '../services';
import { useAuth, useToast, useConfig } from '../store';
import { formatCurrency, formatDurationHours } from '../utils/formatters';
import { ROUTES, IMAGES, SUPPORTED_COUNTRIES } from '../utils/constants';
import { getApiBaseUrl } from '../services/api';

const COURSE_TYPE_LABELS = {
  SELF_PACED: 'Self-Paced Learning',
  LIVE_ONLINE: 'Live Virtual Classroom',
  CLASSROOM: 'In-Person Classroom',
};

function CourseDetail() {
  const { slug } = useParams();
  const [courseId, setCourseId] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const { showSuccess, showError } = useToast();
  const { getCategoryLabel } = useConfig();
  const isAdmin = user?.role === 'ADMIN';

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
  const [upsellOpen, setUpsellOpen] = useState(false);
  const [availableBundles, setAvailableBundles] = useState([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState(new Set());
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

  // Load course data — course, bundles, and enrollment status fetched in parallel
  useEffect(() => {
    const loadCourse = async () => {
      setLoading(true);
      try {
        // Fire course and enrollment in parallel
        const [courseData, enrolled] = await Promise.all([
          courseService.getCourseBySlug(slug),
          isAuthenticated() ? enrollmentService.getEnrolledCourses().catch(() => null) : Promise.resolve(null),
        ]);

        setCourse(courseData);
        setCourseId(courseData.id);

        // Fetch value packs matching the course's categories (by bundle's own category field), deduplicate
        const categories = courseData?.categories || [];
        let bundles = [];
        if (categories.length > 0) {
          const results = await Promise.all(
            categories.map((cat) => getPublishedBundlesByCategory(cat).catch(() => []))
          );
          const seen = new Set();
          for (const list of results) {
            for (const b of (list || [])) {
              if (!seen.has(b.id)) { seen.add(b.id); bundles.push(b); }
            }
          }
        }
        setAvailableBundles(bundles);

        if (enrolled) {
          // Collect all enrolled course IDs for ownership check in upsell dialog
          const ids = new Set(
            enrolled
              .filter((e) => e.status === 'ENROLLED' || e.status === 'COMPLETED')
              .map((e) => (e.course || e).id)
          );
          setEnrolledCourseIds(ids);

          const enrollmentData = enrolled.find((c) => {
            const courseObj = c.course || c;
            return courseObj.id === courseData.id;
          });
          // Only consider as enrolled if status is ENROLLED or COMPLETED (not PENDING)
          const status = enrollmentData?.status;
          const isUserEnrolled = !!enrollmentData && (status === 'ENROLLED' || status === 'COMPLETED');
          setIsEnrolled(isUserEnrolled);
          if (enrollmentData) {
            setEnrollmentStatus(status);
          }

          if (isUserEnrolled) {
            // Load videos and progress in parallel
            const videosData = await courseService.getCourseVideos(courseData.id);
            setVideos(videosData);

            const progress = await videoService.getMultipleProgress(
              videosData.map((v) => v.id)
            );
            setProgressMap(progress);

            // Set first incomplete video as current
            const incompleteVideo = videosData.find((v) => !progress[v.id]?.completed);
            setCurrentVideo(incompleteVideo || videosData[0]);
          }
        }

      } catch (error) {
        if (error.response?.status === 401) {
          console.warn('Session expired while loading course data');
        } else {
          showError('Failed to load course');
        }
      } finally {
        setLoading(false);
      }
    };

    loadCourse();
  }, [slug, isAuthenticated, showError]);

  // Load videos for admin — runs once isAdmin resolves (user hydrates from auth context)
  useEffect(() => {
    if (!isAdmin || !courseId) return;
    const loadAdminVideos = async () => {
      try {
        const videosData = await courseService.getCourseVideos(courseId);
        setVideos(videosData);
        const progress = await videoService.getMultipleProgress(videosData.map((v) => v.id));
        setProgressMap(progress);
        setCurrentVideo(videosData.find((v) => !progress[v.id]?.completed) || videosData[0]);
      } catch {}
    };
    loadAdminVideos();
  }, [courseId, isAdmin]); // eslint-disable-line

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

  // Proceed directly with single-course enrollment (called from upsell dialog skip or when no bundles)
  const handleEnrollSingleCourse = async () => {
    setUpsellOpen(false);
    setEnrolling(true);
    try {
      const result = await enrollmentService.startEnrollment(courseId, selectedCountry);
      const order = result && (result.order ? result.order : result.orderId ? result : null);
      if (order) {
        navigate(ROUTES.PAYMENT, {
          state: { courseId: courseId, courseName: course?.title, order },
        });
        return;
      }
      setIsEnrolled(true);
      showSuccess('Successfully enrolled!');
      const videosData = await courseService.getCourseVideos(courseId);
      setVideos(videosData);
      setCurrentVideo(videosData[0]);
    } catch (error) {
      if (error.message !== 'Payment cancelled') {
        setEnrollmentError(
          error.response?.status === 401
            ? 'Session expired. Please login again to enroll.'
            : error.message || 'Failed to enroll'
        );
        setEnrollmentErrorOpen(true);
      }
    } finally {
      setEnrolling(false);
    }
  };

  // Enroll in multiple bundles via a single Razorpay payment.
  // courseIsStandalone=true means the user also selected the current course (not inside any bundle),
  // so its price is included in the same order and it is enrolled on confirmation.
  const handleEnrollBundles = async (bundleIds, courseIsStandalone = false) => {
    setUpsellOpen(false);
    setEnrolling(true);
    try {
      const standaloneCourseId = courseIsStandalone ? courseId : null;
      const result = await startMultiBundleEnrollment(bundleIds, selectedCountry, standaloneCourseId);
      const order = result?.order;
      if (order) {
        const bundlePart = `${bundleIds.length} value pack${bundleIds.length > 1 ? 's' : ''}`;
        navigate(ROUTES.PAYMENT, {
          state: {
            bundleIds,
            courseId: standaloneCourseId, // passed to confirm so backend enrolls in it
            courseName: courseIsStandalone ? `${bundlePart} + ${course?.title}` : bundlePart,
            order,
          },
        });
      }
    } catch (error) {
      if (error.message !== 'Payment cancelled') {
        setEnrollmentError(error.message || 'Failed to start bundle enrollment');
        setEnrollmentErrorOpen(true);
      }
    } finally {
      setEnrolling(false);
    }
  };

  // Handle enrollment — shows upsell dialog if bundles exist
  const handleEnroll = async () => {
    if (!isAuthenticated()) {
      navigate(ROUTES.LOGIN, { state: { from: location } });
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

    // Show bundle upsell dialog only for paid courses (free courses enroll directly)
    if (availableBundles.length > 0 && displayPrice.amount) {
      setUpsellOpen(true);
      return;
    }

    setEnrolling(true);
    try {
      const result = await enrollmentService.startEnrollment(courseId, selectedCountry);

      // Detect order shape: backend may return order object directly or wrapped
      const order = result && (result.order ? result.order : result.orderId ? result : null);
      if (order) {
        navigate(ROUTES.PAYMENT, {
          state: {
            courseId: courseId,
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
      const videosData = await courseService.getCourseVideos(courseId);
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


  // Mark video as completed when user clicks play in the video player
  const handleVideoPlay = useCallback(async () => {
    if (!currentVideo) return;
    // Update UI optimistically first
    setProgressMap((prev) => {
      if (prev[currentVideo.id]?.completed) return prev; // already marked
      const updated = {
        ...prev,
        [currentVideo.id]: { ...(prev[currentVideo.id] || {}), completed: true },
      };
      const allDone = videos.length > 0 && videos.every((v) => updated[v.id]?.completed);
      if (allDone) {
        setEnrollmentStatus('COMPLETED');
        showSuccess('Course completed! All videos finished.');
      }
      return updated;
    });
    // Persist to server silently
    try {
      await videoService.updateProgress(currentVideo.id, currentVideo.durationSeconds || 0, true);
    } catch (err) {
      console.error('Failed to mark video complete:', err);
    }
  }, [currentVideo, videos, showSuccess]);

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

    // Update UI optimistically first
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

    // Persist to server silently
    try {
      await videoService.updateProgress(currentVideo.id, currentVideo.durationSeconds || 0, true);
    } catch (error) {
      console.error('Failed to mark video complete:', error);
    }
  }, [currentVideo, videos, progressMap, showSuccess]);

  // Download certificate
  const handleDownloadCertificate = async () => {
    try {
      await certificateService.downloadAndSaveCertificate(courseId, course?.title);
      showSuccess('Certificate downloaded!');
    } catch (error) {
      if (error.response?.status === 403) {
        setCertificateError('Please ensure you have completed both the Pre-Assessment and Assessment. Your result will be reviewed and the certificate will be issued within 24–48 hours after completion of both assessments.');
      } else if (error.response?.status === 404) {
        setCertificateError('Your certificate is being prepared. Please ensure you have completed both the Pre-Assessment and Assessment. The certificate will be issued within 24–48 hours after your results are reviewed.');
      } else {
        setCertificateError('Please ensure you have completed both the Pre-Assessment and Assessment. Your result will be reviewed and the certificate will be issued within 24–48 hours.');
      }
      setCertificateErrorOpen(true);
    }
  };

  // Handle unenroll
  const handleUnenroll = async () => {
    try {
      await enrollmentService.unenroll(courseId);
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
    { label: course.title, path: ROUTES.COURSE_DETAIL(course.slug || slug) },
  ];

  const imgPath = course.descriptionImageUrl || course.thumbnailImageUrl || course.imageUrl;

  const isValidUrl = (url) => {
    try { const u = new URL(url); return u.protocol === 'http:' || u.protocol === 'https:'; }
    catch { return false; }
  };

  return (
    <>
      {course && (
        <SEO
          title={course.title}
          description={course.shortDescription || course.description?.substring(0, 160)}
          path={`/courses/${course.slug || slug}`}
          image={courseId ? `${getApiBaseUrl()}/api/courses/${courseId}/thumbnail` : undefined}
          structuredData={courseSchema(course)}
        />
      )}

      {/* ── Hero Banner ────────────────────────────────────────────────────── */}
      <Box
        sx={{
          position: 'relative',
          minHeight: { xs: 240, md: 320 },
          display: 'flex',
          alignItems: 'flex-end',
          overflow: 'hidden',
        }}
      >
        {imgPath ? (
          <Box
            component="img"
            src={`${getApiBaseUrl()}${imgPath}`}
            alt={course.title}
            sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)' }} />
        )}
        <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.78) 100%)' }} />
        <Container maxWidth="lg" sx={{ position: 'relative', pb: { xs: 4, md: 5 }, pt: { xs: 8, md: 10 } }}>
          {course.categories?.length > 0 && (
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 2 }}>
              {course.categories.map((cat) => (
                <Chip
                  key={cat}
                  icon={<CategoryIcon sx={{ color: 'rgba(255,255,255,0.85) !important', fontSize: '14px !important' }} />}
                  label={getCategoryLabel(cat)}
                  size="small"
                  sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }}
                />
              ))}
            </Box>
          )}
          <Typography
            variant="h3"
            component="h1"
            sx={{ color: '#fff', fontWeight: 800, mb: 1.5, textShadow: '0 2px 8px rgba(0,0,0,0.4)', lineHeight: 1.2, fontSize: { xs: '1.75rem', md: '2.5rem' } }}
          >
            {course.title}
          </Typography>
          {course.tagline && (
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                px: 2,
                py: 0.5,
                mb: 2,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #1976D2 0%, #1565C0 100%)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
              }}
            >
              <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600, letterSpacing: 0.3 }}>
                {course.tagline}
              </Typography>
            </Box>
          )}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {course.durationHours && (
              <Chip
                icon={<AccessTimeIcon sx={{ color: 'rgba(255,255,255,0.85) !important', fontSize: '14px !important' }} />}
                label={formatDurationHours(course.durationHours)}
                size="small"
                sx={{ bgcolor: 'rgba(255,255,255,0.12)', color: '#fff', border: '1px solid rgba(255,255,255,0.25)' }}
              />
            )}
            {course.courseType && (
              <Chip
                icon={<ComputerIcon sx={{ color: 'rgba(255,255,255,0.85) !important', fontSize: '14px !important' }} />}
                label={COURSE_TYPE_LABELS[course.courseType] || course.courseType}
                size="small"
                sx={{ bgcolor: 'rgba(255,255,255,0.12)', color: '#fff', border: '1px solid rgba(255,255,255,0.25)' }}
              />
            )}
          </Box>
        </Container>
      </Box>

      {/* ── Body ──────────────────────────────────────────────────────────── */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Breadcrumb items={breadcrumbItems} />

        {/* ── Mobile-only quick enroll bar ─────────────────────────────────── */}
        {!isEnrolled && !learnMode && (
          <Box sx={{ display: { xs: 'block', md: 'none' }, mb: 3 }}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'primary.light',
                background: (theme) =>
                  theme.palette.mode === 'dark'
                    ? 'rgba(25,118,210,0.08)'
                    : 'rgba(25,118,210,0.05)',
              }}
            >
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
                    onChange={(_, newValue) => { if (newValue) setSelectedCountry(newValue.code); }}
                    renderInput={(params) => <TextField {...params} label="Select your country" size="small" />}
                    isOptionEqualToValue={(option, value) => option.code === value?.code}
                    disableClearable
                    fullWidth
                    size="small"
                    sx={{ mb: 1.5 }}
                  />
                );
              })()}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="h5" color="primary" fontWeight={800} sx={{ flexShrink: 0 }}>
                  {displayPrice.amount ? formatCurrency(displayPrice.amount, displayPrice.currency) : 'Free'}
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  onClick={handleEnroll}
                  loading={enrolling}
                  disabled={loading}
                  sx={{ fontWeight: 700 }}
                >
                  Enroll & Get Certified
                </Button>
              </Box>
            </Paper>
          </Box>
        )}

        <Grid container spacing={4} sx={{ mt: 0.5 }}>
          {/* ── Main content ── */}
          <Grid item xs={12} md={8}>
            {(isEnrolled || isAdmin) && learnMode && currentVideo && currentVideoUrl ? (
              <>
                <VideoPlayer
                  src={currentVideoUrl}
                  title={currentVideo.title}
                  initialPosition={progressMap[currentVideo.id]?.lastPositionSeconds || 0}
                  onProgress={handleVideoProgress}
                  onComplete={handleVideoComplete}
                  onPlay={handleVideoPlay}
                  userEmail={user?.email}
                />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2, mb: 1 }}>
                  <Typography variant="h5" fontWeight={600} sx={{ flex: 1 }}>{currentVideo.title}</Typography>
                  {progressMap[currentVideo.id]?.completed && (
                    <Chip icon={<CheckCircleOutlineIcon />} label="Completed" color="success" variant="outlined" size="small" />
                  )}
                </Box>

                {/* Pre-Assessment Section */}
                {(() => {
                  let links = [];
                  try { if (course.preAssessmentLinks) links = JSON.parse(course.preAssessmentLinks); } catch {}
                  const validLinks = links.filter(l => l.url && isValidUrl(l.url));
                  if (validLinks.length === 0) return null;
                  const instructions = course.preAssessmentInstructions?.trim()
                    || 'Complete the pre-assessment before starting your learning journey. This helps us understand your baseline knowledge.';
                  return (
                    <Paper variant="outlined" sx={{ p: 3, mt: 3, borderRadius: 2, borderColor: 'primary.light', bgcolor: 'rgba(25,118,210,0.04)' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                        <AssignmentIcon color="primary" />
                        <Typography variant="h6" fontWeight={700} color="primary">Pre-Assessment</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 2 }}>
                        <InfoOutlinedIcon sx={{ fontSize: 17, color: 'primary.main', mt: 0.2, flexShrink: 0 }} />
                        <Typography variant="body2" color="text.secondary">{instructions}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {validLinks.map((link, i) => (
                          <Button key={i} variant="outlined" color="primary" href={link.url} target="_blank" rel="noopener noreferrer" startIcon={<AssignmentIcon />}>
                            {link.title || 'Take Pre-Assessment'}
                          </Button>
                        ))}
                      </Box>
                    </Paper>
                  );
                })()}

                {/* Manuals & Documents — below pre-assessment */}
                {course?.id && (
                  <Box sx={{ mt: 3 }}>
                    <ManualSection courseId={course.id} title="Course Materials" />
                  </Box>
                )}
              </>
            ) : (isEnrolled || isAdmin) && learnMode && currentVideo && !currentVideoUrl ? (
              <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
                <CircularProgress size={36} sx={{ display: 'block', mx: 'auto', mb: 2 }} />
                <Typography color="text.secondary">Loading video...</Typography>
              </Paper>
            ) : (
              <Box>
                {/* Short description callout */}
                {course.shortDescription && (
                  <Paper
                    variant="outlined"
                    sx={{ p: 3, mb: 3, borderRadius: 2, borderLeft: '4px solid', borderLeftColor: 'primary.main', bgcolor: 'rgba(25,118,210,0.04)' }}
                  >
                    <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8, fontStyle: 'italic' }}>
                      {course.shortDescription}
                    </Typography>
                  </Paper>
                )}

                {/* Overview */}
                {course.description && (
                  <Paper elevation={0} variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                    <Typography variant="h6" fontWeight={700} color="primary" gutterBottom>Overview</Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Typography color="text.secondary" sx={{ whiteSpace: 'pre-line', lineHeight: 1.8 }}>
                      {course.description}
                    </Typography>
                  </Paper>
                )}

                {/* Key Components */}
                {course.keyComponents && course.keyComponents.length > 0 && (
                  <Paper elevation={0} variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                    <Typography variant="h6" fontWeight={700} color="primary" gutterBottom>Key Components</Typography>
                    <Divider sx={{ mb: 2 }} />
                    {course.keyComponents.map((comp, idx) => (
                      <Box key={idx} sx={{ mb: 2.5 }}>
                        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 0.75 }}>{comp.title}</Typography>
                        {comp.points && comp.points.length > 0 && (
                          <Box component="ul" sx={{ pl: 0, listStyle: 'none', m: 0 }}>
                            {comp.points.map((point, pIdx) => (
                              <Box component="li" key={pIdx} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 0.5 }}>
                                <CheckCircleOutlineIcon sx={{ fontSize: 18, color: 'success.main', mt: 0.3, flexShrink: 0 }} />
                                <Typography variant="body2" color="text.secondary">{point}</Typography>
                              </Box>
                            ))}
                          </Box>
                        )}
                      </Box>
                    ))}
                  </Paper>
                )}

                {/* Target Audience */}
                {course.targetAudience && (
                  <Paper elevation={0} variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                      <PeopleIcon color="primary" />
                      <Typography variant="h6" fontWeight={700} color="primary">Target Audience</Typography>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    <Typography color="text.secondary" sx={{ whiteSpace: 'pre-line', lineHeight: 1.8 }}>{course.targetAudience}</Typography>
                  </Paper>
                )}

                {/* Assessment */}
                {course.assessment && (
                  <Paper elevation={0} variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                      <AssignmentIcon color="primary" />
                      <Typography variant="h6" fontWeight={700} color="primary">Assessment</Typography>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    <Typography color="text.secondary" sx={{ whiteSpace: 'pre-line', lineHeight: 1.8 }}>{course.assessment}</Typography>
                  </Paper>
                )}

                {/* Outcome */}
                {course.outcome && (
                  <Paper elevation={0} variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                      <EmojiEventsIcon color="primary" />
                      <Typography variant="h6" fontWeight={700} color="primary">Outcome</Typography>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    <Typography color="text.secondary" sx={{ whiteSpace: 'pre-line', lineHeight: 1.8 }}>{course.outcome}</Typography>
                  </Paper>
                )}

                {/* Course Duration */}
                {course.courseDurationText && (
                  <Paper elevation={0} variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                      <ScheduleIcon color="primary" />
                      <Typography variant="h6" fontWeight={700} color="primary">Course Duration</Typography>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    <Typography color="text.secondary" sx={{ whiteSpace: 'pre-line', lineHeight: 1.8 }}>{course.courseDurationText}</Typography>
                  </Paper>
                )}

                {/* Exam Details */}
                {course.examDetails && course.examDetails.length > 0 && (
                  <Paper elevation={0} variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                      <QuizIcon color="primary" />
                      <Typography variant="h6" fontWeight={700} color="primary">Exam Details</Typography>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    <Box component="ul" sx={{ pl: 0, listStyle: 'none', m: 0 }}>
                      {course.examDetails.map((detail, idx) => (
                        <Box component="li" key={idx} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 0.5 }}>
                          <CheckCircleOutlineIcon sx={{ fontSize: 18, color: 'success.main', mt: 0.3, flexShrink: 0 }} />
                          <Typography variant="body2" color="text.secondary">{detail}</Typography>
                        </Box>
                      ))}
                    </Box>
                  </Paper>
                )}

                {/* CTA buttons — hidden on mobile (top bar + sidebar card cover it) */}
                <Box sx={{ textAlign: 'center', mt: 3, mb: 2, display: { xs: 'none', md: 'block' } }}>
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
            )}
          </Grid>

          {/* ── Sidebar ── */}
          <Grid item xs={12} md={4}>
            {(isEnrolled || isAdmin) && learnMode ? (
              <>
                {/* Course Content */}
                <Paper sx={{ mb: 3, borderRadius: 2, overflow: 'hidden' }}>
                  <Box
                    sx={{
                      p: 2,
                      pb: 1.5,
                      background: (theme) =>
                        `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                    }}
                  >
                    <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600 }}>Course Content</Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.85)' }}>
                      {completedVideos} of {totalVideos} completed
                    </Typography>
                  </Box>
                  <Divider />
                  <VideoList
                    videos={videos}
                    currentVideoId={currentVideo?.id}
                    progressMap={progressMap}
                    onVideoSelect={setCurrentVideo}
                  />
                </Paper>

                {/* Progress */}
                <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                  <Typography variant="h6" gutterBottom fontWeight={600}>Your Progress</Typography>
                  <ProgressTracker
                    value={completedVideos}
                    max={totalVideos}
                    label={`${completedVideos} of ${totalVideos} videos completed`}
                    variant="circular"
                    size="medium"
                    color={isCompleted ? 'success' : 'primary'}
                  />
                  {isCompleted && (
                    <Button variant="outlined" fullWidth sx={{ mt: 2 }} onClick={handleDownloadCertificate}>
                      Download Certificate
                    </Button>
                  )}
                  <Box sx={{ mt: 2 }}>
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

                {/* Assessment Links */}
                {(() => {
                  let links = [];
                  try { if (course.assessmentLinks) links = JSON.parse(course.assessmentLinks); } catch {}
                  if (links.length === 0 && course.testLink && isValidUrl(course.testLink)) {
                    links = [{ title: 'Take Assessment', url: course.testLink }];
                  }
                  const validLinks = links.filter(l => l.url && isValidUrl(l.url));
                  if (validLinks.length === 0) return null;
                  return (
                    <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <AssignmentIcon color="primary" />
                        <Typography variant="h6" fontWeight={600}>Course Assessment</Typography>
                      </Box>
                      {course.testDescription && links.length === 1 && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{course.testDescription}</Typography>
                      )}
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {validLinks.map((link, i) => (
                          <Button
                            key={i}
                            variant="contained"
                            fullWidth
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            startIcon={<AssignmentIcon />}
                          >
                            {link.title || 'Take Assessment'}
                          </Button>
                        ))}
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mt: 2 }}>
                        <InfoOutlinedIcon sx={{ fontSize: 18, color: 'text.secondary', mt: 0.2 }} />
                        <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                          Please complete both the Pre-Assessment and Assessment. Your result will be reviewed and the certificate will be issued within 24–48 hours after completion of both assessments.
                        </Typography>
                      </Box>
                    </Paper>
                  );
                })()}

              </>
            ) : null}

            {/* Enrollment Card — always shown */}
            <Paper sx={{ p: 3, mb: 3, borderRadius: 2, position: { md: 'sticky' }, top: { md: 80 } }}>
              <Typography variant="h6" gutterBottom fontWeight={700}>
                {isEnrolled ? 'Course Access' : 'Enroll in This Course'}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CategoryIcon color="action" fontSize="small" />
                    <Typography variant="body2">
                      Category: <strong>{course.categories?.map(getCategoryLabel).join(', ') || 'General'}</strong>
                    </Typography>
                  </Box>
                  {course.courseType && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ComputerIcon color="action" fontSize="small" />
                      <Typography variant="body2">
                        Mode: <strong>{COURSE_TYPE_LABELS[course.courseType] || course.courseType}</strong>
                      </Typography>
                    </Box>
                  )}
                  {course.durationHours && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AccessTimeIcon color="action" fontSize="small" />
                      <Typography variant="body2">
                        Duration: <strong>{formatDurationHours(course.durationHours)}</strong>
                      </Typography>
                    </Box>
                  )}
                </Box>
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
                      onChange={(_, newValue) => { if (newValue) setSelectedCountry(newValue.code); }}
                      renderInput={(params) => <TextField {...params} label="Select your country" size="small" />}
                      isOptionEqualToValue={(option, value) => option.code === value?.code}
                      disableClearable
                      fullWidth
                      size="small"
                    />
                  );
                })()}
                <Typography variant="h5" color="primary" fontWeight={700}>
                  {formatCurrency(displayPrice.amount, displayPrice.currency)}
                </Typography>
                {isAdmin ? (
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    startIcon={<ExitToAppIcon sx={{ transform: 'rotate(180deg)' }} />}
                    onClick={() => setLearnMode(true)}
                  >
                    Preview Course Content
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    onClick={handleEnroll}
                    loading={enrolling}
                    disabled={isEnrolled || loading}
                  >
                    {isEnrolled ? 'Already Enrolled' : (displayPrice.amount ? 'Enroll & Get Certified' : 'Enroll Free')}
                  </Button>
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Bundle Upsell Dialog */}
        <EnrollmentUpsellDialog
          open={upsellOpen}
          onClose={() => setUpsellOpen(false)}
          course={course}
          availableBundles={availableBundles}
          selectedCountry={selectedCountry}
          displayPrice={displayPrice}
          enrolledCourseIds={enrolledCourseIds}
          onEnrollSingle={handleEnrollSingleCourse}
          onEnrollBundles={handleEnrollBundles}
        />

        {/* Unenroll Dialog */}
        <Dialog open={unenrollDialogOpen} onClose={(e, reason) => { if (reason !== 'backdropClick') setUnenrollDialogOpen(false); }} disableEscapeKeyDown aria-labelledby="unenroll-dialog-title">
          <DialogTitle id="unenroll-dialog-title">Unenroll from Course?</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to unenroll from "{course?.title}"? Your progress will be lost and you may need to pay again if it's a paid course.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setUnenrollDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUnenroll} color="error" variant="contained">Unenroll</Button>
          </DialogActions>
        </Dialog>

        {/* Certificate Error Dialog */}
        <Dialog open={certificateErrorOpen} onClose={(e, reason) => { if (reason !== 'backdropClick') setCertificateErrorOpen(false); }} disableEscapeKeyDown aria-labelledby="certificate-error-title">
          <DialogTitle id="certificate-error-title">Certificate Not Yet Available</DialogTitle>
          <DialogContent>
            <DialogContentText>{certificateError}</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCertificateErrorOpen(false)} variant="contained">OK</Button>
          </DialogActions>
        </Dialog>

        {/* Enrollment Error Dialog */}
        <Dialog open={enrollmentErrorOpen} onClose={(e, reason) => { if (reason !== 'backdropClick') setEnrollmentErrorOpen(false); }} disableEscapeKeyDown aria-labelledby="enrollment-error-title">
          <DialogTitle id="enrollment-error-title">Enrollment Error</DialogTitle>
          <DialogContent>
            <DialogContentText>{enrollmentError}</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEnrollmentErrorOpen(false)} variant="contained">OK</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
}

export default CourseDetail;
