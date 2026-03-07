import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Container, Box, Typography, Button, CircularProgress, Alert,
  Chip, Grid, Accordion, AccordionSummary, AccordionDetails,
  Divider, Paper, TextField, Autocomplete,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import StarIcon from '@mui/icons-material/Star';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PeopleIcon from '@mui/icons-material/People';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ScheduleIcon from '@mui/icons-material/Schedule';
import QuizIcon from '@mui/icons-material/Quiz';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import DownloadIcon from '@mui/icons-material/Download';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { SEO, Breadcrumb } from '../components/common';
import { VideoPlayer, VideoList, ManualSection } from '../components/course';
import { ProgressTracker } from '../components/user';
import { flagshipService } from '../services/flagshipService';
import { videoService } from '../services';
import { useAuth, useToast } from '../store';
import { formatCurrency } from '../utils/formatters';
import { ROUTES, SUPPORTED_COUNTRIES } from '../utils/constants';

// ── Price helpers ────────────────────────────────────────────────────────────

function getDisplayPrice(program, selectedCountry) {
  if (!program) return { amount: null, currency: 'USD' };
  if (!selectedCountry || selectedCountry === 'IN') {
    return { amount: program.price, currency: 'INR' };
  }
  const cp = (program.countryPrices || []).find((p) => p.countryCode === selectedCountry);
  if (cp) return { amount: cp.amount, currency: cp.currencyCode };
  const usCp = (program.countryPrices || []).find((p) => p.countryCode === 'US');
  if (usCp) return { amount: usCp.amount, currency: usCp.currencyCode };
  return { amount: program.price, currency: 'INR' };
}

// ── Section helpers ──────────────────────────────────────────────────────────

function getSectionIconType(title = '') {
  const t = title.toLowerCase();
  if (t.includes('target audience') || t.includes('who should')) return 'people';
  if (t.includes('assessment') || t.includes('exam detail')) return 'assignment';
  if (t.includes('outcome') || t.includes('achievement')) return 'trophy';
  if (t.includes('duration')) return 'schedule';
  return null;
}

function SectionHeading({ title }) {
  const iconType = getSectionIconType(title);
  if (!iconType) {
    return (
      <Typography variant="h5" fontWeight={700} sx={{ mb: 1.5 }}>
        {title}
      </Typography>
    );
  }
  const icons = {
    people: <PeopleIcon color="primary" />,
    assignment: <AssignmentIcon color="primary" />,
    trophy: <EmojiEventsIcon color="primary" />,
    schedule: <ScheduleIcon color="primary" />,
  };
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
      {icons[iconType]}
      <Typography variant="h5" fontWeight={700} color="primary">
        {title}
      </Typography>
    </Box>
  );
}

// ── Section renderers ────────────────────────────────────────────────────────

function OverviewSection({ section }) {
  return (
    <Box>
      {section.title && (
        <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
          {section.title}
        </Typography>
      )}
      <Grid container spacing={2}>
        {(section.items || []).map((item, i) => (
          <Grid item xs={12} sm={6} md={4} key={i}>
            <Paper variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5, borderRadius: 2 }}>
              <InfoOutlinedIcon color="primary" />
              <Typography variant="body2">{item}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

function TextSection({ section }) {
  return (
    <Box>
      {section.title && <SectionHeading title={section.title} />}
      <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8, whiteSpace: 'pre-line' }}>
        {section.content}
      </Typography>
    </Box>
  );
}

function BulletsSection({ section }) {
  return (
    <Box>
      {section.title && <SectionHeading title={section.title} />}
      <Box>
        {(section.items || []).map((item, i) => (
          <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 0.5 }}>
            <CheckCircleOutlineIcon sx={{ fontSize: 18, color: 'success.main', mt: 0.3, flexShrink: 0 }} />
            <Typography variant="body1">{item}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

function ModulesSection({ section }) {
  return (
    <Box>
      {section.title && <SectionHeading title={section.title} />}
      {(section.modules || []).map((mod, i) => (
        <Accordion
          key={i}
          defaultExpanded
          disableGutters
          elevation={0}
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            mb: 1,
            borderRadius: '8px !important',
            '&:before': { display: 'none' },
          }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ borderRadius: 2 }}>
            <Typography fontWeight={600}>{mod.title}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {mod.description && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {mod.description}
              </Typography>
            )}
            {(mod.points || []).length > 0 && (
              <Box>
                {mod.points.map((pt, j) => (
                  <Box key={j} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 0.5 }}>
                    <CheckCircleOutlineIcon sx={{ fontSize: 18, color: 'success.main', mt: 0.2, flexShrink: 0 }} />
                    <Typography variant="body2">{pt}</Typography>
                  </Box>
                ))}
              </Box>
            )}
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
}

function renderSection(section, i) {
  switch (section.type) {
    case 'overview': return <OverviewSection key={i} section={section} />;
    case 'text':     return <TextSection key={i} section={section} />;
    case 'bullets':  return <BulletsSection key={i} section={section} />;
    case 'modules':  return <ModulesSection key={i} section={section} />;
    default:         return null;
  }
}

// ── Course-style field renderers ─────────────────────────────────────────────

function CourseStyleField({ icon, label, children }) {
  return (
    <Paper elevation={0} variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
        {icon}
        <Typography variant="h6" fontWeight={700} color="primary">
          {label}
        </Typography>
      </Box>
      <Divider sx={{ mb: 2 }} />
      {children}
    </Paper>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

function FlagshipDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const { showError, showSuccess } = useToast();

  const [learnMode, setLearnMode] = useState(location.state?.mode === 'learn');

  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState('US');
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollmentStatus, setEnrollmentStatus] = useState(null);
  const [enrolledProgramData, setEnrolledProgramData] = useState(null); // includes canDownloadCertificate

  const [videos, setVideos] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [currentVideo, setCurrentVideo] = useState(null);
  const [currentVideoUrl, setCurrentVideoUrl] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const data = await flagshipService.getProgramById(id);
        if (!cancelled) setProgram(data);

        if (!cancelled && isAuthenticated()) {
          try {
            const enrolledPrograms = await flagshipService.getEnrolledPrograms();
            const enrolledProgram = enrolledPrograms.find((p) => p.id === Number(id));
            const isUserEnrolled = !!enrolledProgram;

            if (!cancelled) {
              setIsEnrolled(isUserEnrolled);
              if (isUserEnrolled) {
                setEnrollmentStatus('ENROLLED');
                setEnrolledProgramData(enrolledProgram);
              }
            }

            if (isUserEnrolled && !cancelled) {
              const videosData = await flagshipService.getVideos(id);
              if (!cancelled) {
                setVideos(videosData);
                const progress = await flagshipService.getMultipleVideoProgress(videosData.map((v) => v.id));
                if (!cancelled) {
                  setProgressMap(progress);
                  const incompleteVideo = videosData.find((v) => !progress[v.id]?.completed);
                  setCurrentVideo(incompleteVideo || videosData[0]);
                }
              }
            }
          } catch { /* non-critical */ }
        }
      } catch {
        if (!cancelled) setError('Failed to load program details.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [id, isAuthenticated]);

  // Decrypt video URL when current video changes
  useEffect(() => {
    const decrypt = async () => {
      if (!currentVideo?.encryptedUrl) { setCurrentVideoUrl(null); return; }
      try {
        const url = await videoService.decryptUrl(currentVideo.encryptedUrl);
        setCurrentVideoUrl(url);
      } catch {
        setCurrentVideoUrl(null);
      }
    };
    decrypt();
  }, [currentVideo]);

  const handleEnroll = useCallback(async () => {
    if (!isAuthenticated()) {
      navigate(ROUTES.LOGIN, { state: { from: `/flagship/${id}` } });
      return;
    }
    if (isEnrolled) {
      setLearnMode(true);
      return;
    }
    setEnrolling(true);
    try {
      const result = await flagshipService.startEnrollment(
        id,
        selectedCountry !== 'IN' ? selectedCountry : null
      );

      // Paid: navigate to Payment page
      const order = result?.order ?? (result?.orderId ? result : null);
      if (order) {
        navigate(ROUTES.PAYMENT, {
          state: {
            flagshipProgramId: Number(id),
            courseName: program.title,
            order,
          },
        });
        return;
      }

      // Free: enrolled directly
      setIsEnrolled(true);
      setEnrollmentStatus('ENROLLED');
      showSuccess('Successfully enrolled!');
    } catch (err) {
      if (err.message === 'Payment cancelled') return;
      showError(err.response?.data?.message || err.message || 'Failed to start enrollment');
    } finally {
      setEnrolling(false);
    }
  }, [isAuthenticated, program, selectedCountry, isEnrolled, navigate, showError, showSuccess, id]);


  // Mark video as completed when user clicks play in the video player
  const handleVideoPlay = useCallback(async () => {
    if (!currentVideo) return;
    try {
      await flagshipService.updateVideoProgress(currentVideo.id, currentVideo.durationSeconds || 0, true);
      setProgressMap((prev) => {
        if (prev[currentVideo.id]?.completed) return prev; // already marked
        const updated = {
          ...prev,
          [currentVideo.id]: { ...(prev[currentVideo.id] || {}), completed: true },
        };
        const allDone = videos.length > 0 && videos.every((v) => updated[v.id]?.completed);
        if (allDone) {
          setEnrollmentStatus('COMPLETED');
          showSuccess('All videos completed!');
        }
        return updated;
      });
    } catch (err) {
      console.error('Failed to mark flagship video complete:', err);
      showError('Could not save video progress. Please check your connection.');
    }
  }, [currentVideo, videos, showSuccess, showError]);

  const handleVideoProgress = useCallback(async (positionSeconds) => {
    if (!currentVideo) return;
    try {
      const progress = await flagshipService.updateVideoProgress(currentVideo.id, positionSeconds);
      const wasCompleted = !!progressMap[currentVideo.id]?.completed;
      const isNowCompleted = !!progress?.completed;
      setProgressMap((prev) => ({ ...prev, [currentVideo.id]: progress }));
      if (isNowCompleted && !wasCompleted) {
        const newProgressMap = { ...progressMap, [currentVideo.id]: progress };
        const allDone = videos.every((v) => !!newProgressMap[v.id]?.completed);
        if (allDone) { setEnrollmentStatus('COMPLETED'); showSuccess('All videos completed!'); }
        else { showSuccess('Video completed!'); }
        const currentIndex = videos.findIndex((v) => v.id === currentVideo.id);
        if (currentIndex < videos.length - 1) setCurrentVideo(videos[currentIndex + 1]);
      }
    } catch {}
  }, [currentVideo, progressMap, videos, showSuccess]);

  const handleVideoComplete = useCallback(async () => {
    if (!currentVideo) return;
    try {
      await flagshipService.updateVideoProgress(currentVideo.id, currentVideo.durationSeconds || 0, true);
      const newProgressMap = {
        ...progressMap,
        [currentVideo.id]: { ...progressMap[currentVideo.id], completed: true },
      };
      setProgressMap(newProgressMap);
      const allDone = videos.every((v) => newProgressMap[v.id]?.completed);
      if (allDone) { setEnrollmentStatus('COMPLETED'); showSuccess('All videos completed!'); }
      else { showSuccess('Video completed!'); }
      const currentIndex = videos.findIndex((v) => v.id === currentVideo.id);
      if (currentIndex < videos.length - 1) setCurrentVideo(videos[currentIndex + 1]);
    } catch {}
  }, [currentVideo, videos, progressMap, showSuccess]);

  const handleDownloadCertificate = useCallback(async () => {
    try {
      await flagshipService.downloadAndSaveCertificate(id, program?.title || 'program');
      showSuccess('Certificate downloaded!');
    } catch (err) {
      if (err.response?.status === 403) {
        showError('Please ensure you have completed both the Pre-Assessment and Assessment. Your result will be reviewed and the certificate will be issued within 24–48 hours after completion of both assessments.');
      } else if (err.response?.status === 404) {
        showError('Your certificate is being prepared. Please ensure you have completed both the Pre-Assessment and Assessment. The certificate will be issued within 24–48 hours after your results are reviewed.');
      } else {
        showError('Please ensure you have completed both the Pre-Assessment and Assessment. Your result will be reviewed and the certificate will be issued within 24–48 hours.');
      }
    }
  }, [id, program, showSuccess, showError]);

  const completedVideos = Object.values(progressMap).filter((p) => p?.completed).length;
  const totalVideos = videos.length;

  // Each video contributes 0–1: completed=1, in-progress with duration=proportional,
  // in-progress without duration=0.3 (so the tracker moves as soon as anything is watched)
  const totalProgressScore = totalVideos === 0 ? 0 : videos.reduce((sum, v) => {
    const p = progressMap[v.id];
    if (p?.completed) return sum + 1;
    const pos = p?.lastPositionSeconds || 0;
    if (pos > 0 && v.durationSeconds > 0) return sum + Math.min(pos / v.durationSeconds, 0.99);
    if (pos > 0) return sum + 0.3;
    return sum;
  }, 0);

  const progressPercent = totalVideos > 0 ? Math.round((totalProgressScore / totalVideos) * 100) : 0;
  const isCompleted = completedVideos >= totalVideos && totalVideos > 0 || enrollmentStatus === 'COMPLETED';

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
        <CircularProgress />
      </Box>
    );
  }
  if (error || !program) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error || 'Program not found.'}</Alert>
      </Container>
    );
  }

  const hasCountryPrices = (program.countryPrices || []).length > 0;
  const displayPrice = getDisplayPrice(program, selectedCountry);
  const countryOptions = hasCountryPrices
    ? SUPPORTED_COUNTRIES.filter(
        (c) => c.code === 'IN' || program.countryPrices.some((cp) => cp.countryCode === c.code)
      )
    : [];
  const selectedOption = countryOptions.find((c) => c.code === selectedCountry) || countryOptions[0];

  let sections = [];
  try { if (program.sections) sections = JSON.parse(program.sections); } catch {}

  let examDetails = [];
  try { if (program.examDetails) examDetails = JSON.parse(program.examDetails); } catch {}

  let assessmentLinks = [];
  try { if (program.assessmentLinks) assessmentLinks = JSON.parse(program.assessmentLinks); } catch {}

  const hasVideos = videos.length > 0;

  const isValidUrl = (url) => {
    try { const u = new URL(url); return u.protocol === 'http:' || u.protocol === 'https:'; }
    catch { return false; }
  };

  const breadcrumbItems = [
    { label: 'Courses', path: ROUTES.COURSES },
    { label: 'Flagship Programs', path: ROUTES.COURSES_FLAGSHIP },
    { label: program.title },
  ];

  return (
    <>
      <SEO
        title={`${program.title} | UyirGene`}
        description={program.cardDescription || program.tagline}
        path={`/flagship/${program.id}`}
      />

      {/* Hero */}
      <Box
        sx={{
          position: 'relative',
          minHeight: { xs: 260, md: 340 },
          display: 'flex',
          alignItems: 'flex-end',
          overflow: 'hidden',
        }}
      >
        {program.backgroundImageUrl ? (
          <Box
            component="img"
            src={program.backgroundImageUrl}
            alt={program.title}
            sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #7B2D8B 0%, #2C3E50 100%)' }} />
        )}
        <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.78) 100%)' }} />
        <Container maxWidth="lg" sx={{ position: 'relative', pb: { xs: 4, md: 6 }, pt: { xs: 8, md: 10 } }}>
          {program.tagline && (
            <Chip
              icon={<StarIcon sx={{ fontSize: '14px !important', color: '#fff !important' }} />}
              label={program.tagline}
              size="small"
              sx={{ mb: 2, bgcolor: '#7B2D8B', color: '#fff', fontWeight: 600 }}
            />
          )}
          <Typography
            variant="h3"
            component="h1"
            sx={{ color: '#fff', fontWeight: 700, mb: 1, textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}
          >
            {program.title}
          </Typography>
          {program.cardDescription && (
            <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.85)', fontWeight: 400, maxWidth: 640 }}>
              {program.cardDescription}
            </Typography>
          )}
        </Container>
      </Box>

      {/* Body */}
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
                borderColor: '#7B2D8B',
                background: 'rgba(123,45,139,0.06)',
              }}
            >
              {hasCountryPrices && (
                <Autocomplete
                  options={countryOptions}
                  getOptionLabel={(option) => `${option.name} (${option.symbol})`}
                  value={selectedOption || null}
                  onChange={(_, newValue) => { if (newValue) setSelectedCountry(newValue.code); }}
                  renderInput={(params) => (
                    <TextField {...params} label="Select your country" size="small" />
                  )}
                  isOptionEqualToValue={(option, value) => option.code === value?.code}
                  disableClearable
                  fullWidth
                  size="small"
                  sx={{ mb: 1.5 }}
                />
              )}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="h5" fontWeight={800} sx={{ flexShrink: 0, color: '#7B2D8B' }}>
                  {displayPrice.amount ? formatCurrency(displayPrice.amount, displayPrice.currency) : 'Free'}
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  onClick={handleEnroll}
                  disabled={enrolling}
                  sx={{ fontWeight: 700, bgcolor: '#7B2D8B', '&:hover': { bgcolor: '#6A1B7A' } }}
                >
                  {enrolling ? <CircularProgress size={22} color="inherit" /> : 'Enroll & Get Certified'}
                </Button>
              </Box>
            </Paper>
          </Box>
        )}

        <Grid container spacing={4} sx={{ mt: 0.5 }}>
          {/* Left: video player (learn mode) OR content sections */}
          <Grid item xs={12} md={8}>
            {isEnrolled && learnMode && hasVideos ? (
              <>
                {currentVideo && currentVideoUrl ? (
                  <VideoPlayer
                    src={currentVideoUrl}
                    title={currentVideo.title}
                    initialPosition={progressMap[currentVideo.id]?.lastPositionSeconds || 0}
                    onProgress={handleVideoProgress}
                    onComplete={handleVideoComplete}
                    onPlay={handleVideoPlay}
                    userEmail={user?.email}
                  />
                ) : (
                  <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography color="text.secondary">Loading video...</Typography>
                  </Paper>
                )}
                {currentVideo && (
                  <Box sx={{ mt: 2, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="h5" fontWeight={600} sx={{ flex: 1 }}>
                      {currentVideo.title}
                    </Typography>
                    {progressMap[currentVideo.id]?.completed && (
                      <Chip
                        icon={<CheckCircleIcon />}
                        label="Completed"
                        color="success"
                        variant="outlined"
                        size="small"
                      />
                    )}
                  </Box>
                )}

                {/* Pre-Assessment Section — shown below video player */}
                {(() => {
                  const isValidUrl = (url) => { try { const u = new URL(url); return u.protocol === 'http:' || u.protocol === 'https:'; } catch { return false; } };
                  let preLinks = [];
                  try { if (program.preAssessmentLinks) preLinks = JSON.parse(program.preAssessmentLinks); } catch {}
                  const validPreLinks = preLinks.filter(l => l.url && isValidUrl(l.url));
                  if (validPreLinks.length === 0) return null;
                  const instructions = program.preAssessmentInstructions?.trim()
                    || 'Complete the pre-assessment before starting your learning journey. This helps us understand your baseline knowledge.';
                  return (
                    <Paper variant="outlined" sx={{ p: 3, mt: 3, borderRadius: 2, borderColor: 'primary.light' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                        <AssignmentIcon color="primary" />
                        <Typography variant="h6" fontWeight={700} color="primary">Pre-Assessment</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 2 }}>
                        <InfoOutlinedIcon sx={{ fontSize: 17, color: 'primary.main', mt: 0.2, flexShrink: 0 }} />
                        <Typography variant="body2" color="text.secondary">{instructions}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {validPreLinks.map((link, i) => (
                          <Button
                            key={i}
                            variant="outlined"
                            color="primary"
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            startIcon={<AssignmentIcon />}
                          >
                            {link.title || 'Take Pre-Assessment'}
                          </Button>
                        ))}
                      </Box>
                    </Paper>
                  );
                })()}
              </>
            ) : (
              <Box>
                {/* Card Highlights */}
                {program.cardHighlights && (() => {
                  let highlights = [];
                  try { highlights = JSON.parse(program.cardHighlights); } catch {}
                  if (highlights.length === 0) return null;
                  return (
                    <Paper
                      elevation={0}
                      variant="outlined"
                      sx={{ p: 3, mb: 3, borderRadius: 2, background: 'linear-gradient(135deg, rgba(123,45,139,0.04) 0%, rgba(123,45,139,0.01) 100%)' }}
                    >
                      <Typography variant="h6" fontWeight={700} color="primary" gutterBottom>Program Highlights</Typography>
                      <Divider sx={{ mb: 2 }} />
                      <Grid container spacing={1.5}>
                        {highlights.map((h, i) => (
                          <Grid item xs={12} sm={6} key={i}>
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                              <CheckCircleOutlineIcon sx={{ fontSize: 18, color: 'success.main', mt: 0.3, flexShrink: 0 }} />
                              <Typography variant="body2">{h}</Typography>
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    </Paper>
                  );
                })()}

                {/* Content sections from JSON — each in its own card */}
                {sections.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    {sections.map((section, i) => (
                      <Paper key={i} elevation={0} variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                        {renderSection(section, i)}
                      </Paper>
                    ))}
                  </Box>
                )}

                {/* Course-style fields */}
                {program.targetAudience && (
                  <CourseStyleField icon={<PeopleIcon color="primary" />} label="Target Audience">
                    <Typography color="text.secondary" sx={{ whiteSpace: 'pre-line', lineHeight: 1.8 }}>
                      {program.targetAudience}
                    </Typography>
                  </CourseStyleField>
                )}

                {program.assessment && (
                  <CourseStyleField icon={<AssignmentIcon color="primary" />} label="Assessment">
                    <Typography color="text.secondary" sx={{ whiteSpace: 'pre-line', lineHeight: 1.8 }}>
                      {program.assessment}
                    </Typography>
                  </CourseStyleField>
                )}

                {program.outcome && (
                  <CourseStyleField icon={<EmojiEventsIcon color="primary" />} label="Outcome">
                    <Typography color="text.secondary" sx={{ whiteSpace: 'pre-line', lineHeight: 1.8 }}>
                      {program.outcome}
                    </Typography>
                  </CourseStyleField>
                )}

                {program.trainingDuration && (
                  <CourseStyleField icon={<ScheduleIcon color="primary" />} label="Duration of Training">
                    <Typography color="text.secondary">
                      {program.trainingDuration}
                    </Typography>
                  </CourseStyleField>
                )}

                {examDetails.length > 0 && (
                  <CourseStyleField icon={<QuizIcon color="primary" />} label="Exam Details">
                    <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
                      {examDetails.map((detail, i) => (
                        <Box key={i} component="li" sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 0.75 }}>
                          <CheckCircleOutlineIcon sx={{ fontSize: 18, color: 'success.main', mt: 0.2, flexShrink: 0 }} />
                          <Typography variant="body2">{detail}</Typography>
                        </Box>
                      ))}
                    </Box>
                  </CourseStyleField>
                )}

                {sections.length === 0 && !program.cardHighlights && !program.targetAudience && !program.assessment && !program.outcome && examDetails.length === 0 && (
                  <Box sx={{ textAlign: 'center', py: 6 }}>
                    <Typography color="text.secondary">Program details will be available soon.</Typography>
                  </Box>
                )}

                {/* CTA at bottom of content — hidden on mobile (top bar + sidebar card cover it) */}
                {!isEnrolled && (
                  <Box sx={{ textAlign: 'center', mt: 2, mb: 2, display: { xs: 'none', md: 'block' } }}>
                    <Button
                      variant="contained"
                      size="large"
                      onClick={handleEnroll}
                      disabled={enrolling}
                      sx={{ bgcolor: '#7B2D8B', '&:hover': { bgcolor: '#6A1B7A' }, fontWeight: 700, px: 4 }}
                    >
                      {enrolling
                        ? <CircularProgress size={22} color="inherit" />
                        : (displayPrice.amount ? `Enroll for ${formatCurrency(displayPrice.amount, displayPrice.currency)}` : 'Enroll Free')}
                    </Button>
                  </Box>
                )}
                {isEnrolled && !learnMode && hasVideos && (
                  <Box sx={{ textAlign: 'center', mt: 2, mb: 2 }}>
                    <Button
                      variant="contained"
                      size="large"
                      onClick={() => setLearnMode(true)}
                      sx={{ bgcolor: '#4CAF50', '&:hover': { bgcolor: '#388E3C' }, fontWeight: 700, px: 4 }}
                    >
                      Continue Learning
                    </Button>
                  </Box>
                )}
              </Box>
            )}
          </Grid>

          {/* Right: sidebar */}
          <Grid item xs={12} md={4}>
            {/* Manuals & Documents — above enrollment card */}
            {program?.id && (
              <Box sx={{ mb: 3 }}>
                <ManualSection flagshipProgramId={program.id} title="Manuals & Documents" />
              </Box>
            )}

            {/* Learn mode: video list + progress */}
            {isEnrolled && learnMode && hasVideos && (
              <>
                <Paper sx={{ mb: 3, borderRadius: 2, overflow: 'hidden' }}>
                  <Box
                    sx={{
                      p: 2,
                      pb: 1.5,
                      background: 'linear-gradient(135deg, #7B2D8B, #5C1D6B)',
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

                <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                  <Typography variant="h6" gutterBottom fontWeight={600}>Your Progress</Typography>
                  <ProgressTracker
                    value={totalProgressScore}
                    max={totalVideos}
                    label={`${completedVideos} of ${totalVideos} videos completed`}
                    variant="circular"
                    size="medium"
                    color={isCompleted ? 'success' : 'primary'}
                  />
                  {enrolledProgramData?.canDownloadCertificate && (
                    <Button
                      variant="contained"
                      color="success"
                      fullWidth
                      startIcon={<CardMembershipIcon />}
                      onClick={handleDownloadCertificate}
                      sx={{ mt: 2 }}
                    >
                      Download Certificate
                    </Button>
                  )}
                </Paper>
              </>
            )}

            {/* Enrollment sidebar */}
            <Paper sx={{ p: 3, borderRadius: 2, position: { md: 'sticky' }, top: { md: 80 } }}>
              <Typography variant="h6" gutterBottom fontWeight={700}>
                {isEnrolled ? 'Program Access' : 'Enroll in This Program'}
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {hasCountryPrices && !isEnrolled && (
                  <Autocomplete
                    options={countryOptions}
                    getOptionLabel={(option) => `${option.name} (${option.symbol})`}
                    value={selectedOption || null}
                    onChange={(_, newValue) => { if (newValue) setSelectedCountry(newValue.code); }}
                    renderInput={(params) => (
                      <TextField {...params} label="Select your country" size="small" />
                    )}
                    isOptionEqualToValue={(option, value) => option.code === value?.code}
                    disableClearable
                    fullWidth
                    size="small"
                  />
                )}

                {!isEnrolled && (
                  displayPrice.amount != null ? (
                    <Typography variant="h5" color="primary" fontWeight={700}>
                      {formatCurrency(displayPrice.amount, displayPrice.currency)}
                    </Typography>
                  ) : (
                    <Typography variant="h5" color="primary" fontWeight={700}>
                      Contact for pricing
                    </Typography>
                  )
                )}

                {isEnrolled ? (
                  learnMode ? (
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<ExitToAppIcon sx={{ transform: 'rotate(180deg)' }} />}
                      onClick={() => setLearnMode(false)}
                    >
                      Back to Program Info
                    </Button>
                  ) : (
                    hasVideos ? (
                      <Button
                        variant="contained"
                        fullWidth
                        onClick={() => setLearnMode(true)}
                        sx={{ bgcolor: '#4CAF50', '&:hover': { bgcolor: '#388E3C' }, fontWeight: 700 }}
                      >
                        Continue Learning
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        fullWidth
                        onClick={() => navigate(ROUTES.MY_COURSES)}
                        sx={{ bgcolor: '#4CAF50', '&:hover': { bgcolor: '#388E3C' }, fontWeight: 700 }}
                      >
                        Go to My Courses
                      </Button>
                    )
                  )
                ) : (
                  <Button
                    variant="contained"
                    fullWidth
                    disabled={enrolling}
                    onClick={handleEnroll}
                    sx={{ bgcolor: '#7B2D8B', '&:hover': { bgcolor: '#6A1B7A' }, fontWeight: 700 }}
                  >
                    {enrolling
                      ? <CircularProgress size={22} color="inherit" />
                      : (displayPrice.amount ? 'Enroll & Get Certified' : 'Enroll Free')}
                  </Button>
                )}

                {/* Assessment links */}
                {assessmentLinks.length > 0 && (
                  <>
                    <Divider />
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AssignmentIcon fontSize="small" color="primary" />
                        <Typography variant="body2" fontWeight={600} color="primary">Assessments</Typography>
                      </Box>
                      {assessmentLinks.map((link, i) => {
                        const isValid = (() => { try { const u = new URL(link.url); return u.protocol === 'http:' || u.protocol === 'https:'; } catch { return false; } })();
                        if (!isValid) return null;
                        return (
                          <Button
                            key={i}
                            variant="outlined"
                            fullWidth
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            startIcon={<AssignmentIcon />}
                          >
                            {link.title || 'Take Assessment'}
                          </Button>
                        );
                      })}
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                        <InfoOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary', mt: 0.2, flexShrink: 0 }} />
                        <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                          Please complete both the Pre-Assessment and Assessment. Your result will be reviewed and the certificate will be issued within 24–48 hours after completion of both.
                        </Typography>
                      </Box>
                    </Box>
                  </>
                )}

                {/* Certificate download — shown in sidebar when not in learn mode */}
                {isEnrolled && !learnMode && enrolledProgramData?.canDownloadCertificate && (
                  <>
                    <Divider />
                    <Button
                      variant="contained"
                      color="success"
                      fullWidth
                      startIcon={<CardMembershipIcon />}
                      onClick={handleDownloadCertificate}
                    >
                      Download Certificate
                    </Button>
                  </>
                )}

              </Box>
            </Paper>
          </Grid>
        </Grid>

      </Container>
    </>
  );
}

export default FlagshipDetail;
