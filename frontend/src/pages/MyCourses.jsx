import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Typography, Box, Grid, Card, CardMedia, CardContent,
  CardActions, Button, Chip, Divider,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
} from '@mui/material';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import StarIcon from '@mui/icons-material/Star';
import DownloadIcon from '@mui/icons-material/Download';
import { Breadcrumb, LoadingSpinner, EmptyState } from '../components/common';
import { EnrolledCourseCard } from '../components/user';
import { enrollmentService, certificateService, courseService, videoService } from '../services';
import { flagshipService } from '../services/flagshipService';
import { useToast, useConfig } from '../store';
import { ROUTES, IMAGES } from '../utils/constants';
import { getApiBaseUrl } from '../services/api';
import SchoolIcon from '@mui/icons-material/School';

function MyCourses() {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const { getImage } = useConfig();
  const [courses, setCourses] = useState([]);
  const [flagshipPrograms, setFlagshipPrograms] = useState([]);
  const [progressData, setProgressData] = useState({});
  const [loading, setLoading] = useState(true);
  const [unenrollFlagshipTarget, setUnenrollFlagshipTarget] = useState(null);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const [data, flagshipData] = await Promise.all([
          enrollmentService.getEnrolledCourses(),
          flagshipService.getEnrolledPrograms().catch(() => []),
        ]);
        // Only show courses with ENROLLED or COMPLETED status (not PENDING)
        const confirmedEnrollments = data.filter(
          (e) => e.status === 'ENROLLED' || e.status === 'COMPLETED'
        );
        setCourses(confirmedEnrollments);
        setFlagshipPrograms(Array.isArray(flagshipData) ? flagshipData : []);
        await loadProgressForCourses(confirmedEnrollments);
      } catch (error) {
        if (error.response?.status === 401) {
          showError('Session expired. Please login again.');
        } else {
          showError('Failed to load your courses');
        }
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, [showError]);

  const handleDownloadCertificate = async (courseId, courseName) => {
    try {
      await certificateService.downloadAndSaveCertificate(courseId, courseName);
      showSuccess('Certificate downloaded!');
    } catch (error) {
      // Check if it's a result not published error
      if (error.response?.status === 403) {
        showError('Results not yet published. Certificate download will be available after results are published.');
      } else if (error.response?.status === 404) {
        showError('Certificate not found. Please wait for admin to generate your certificate.');
      } else {
        showError(error.message || 'Certificate not available yet');
      }
    }
  };

  const handleDownloadFlagshipCertificate = async (programId, programName) => {
    try {
      await flagshipService.downloadAndSaveCertificate(programId, programName);
      showSuccess('Certificate downloaded!');
    } catch (error) {
      if (error.response?.status === 403) {
        showError('Results not yet published. Certificate download will be available after results are published.');
      } else if (error.response?.status === 404) {
        showError('Certificate not found. Please wait for admin to generate your certificate.');
      } else {
        showError(error.message || 'Certificate not available yet');
      }
    }
  };

  const loadProgressForCourses = async (data) => {
    const progressMap = {};
    await Promise.all(
      data.map(async (item) => {
        const course = item.course || item;
        try {
          const videos = await courseService.getCourseVideos(course.id);
          const total = videos.length;
          let completed = 0;
          for (const video of videos) {
            try {
              const p = await videoService.getProgress(video.id);
              if (p?.completed) completed++;
            } catch (_) {}
          }
          progressMap[course.id] = {
            totalVideos: total,
            completedVideos: completed,
            percent: total > 0 ? Math.round((completed / total) * 100) : 0,
          };
        } catch (_) {
          progressMap[course.id] = { totalVideos: 0, completedVideos: 0, percent: 0 };
        }
      })
    );
    setProgressData(progressMap);
  };

  const reload = async () => {
    setLoading(true);
    try {
      const [data, flagshipData] = await Promise.all([
        enrollmentService.getEnrolledCourses(),
        flagshipService.getEnrolledPrograms().catch(() => []),
      ]);
      const confirmedEnrollments = data.filter(
        (e) => e.status === 'ENROLLED' || e.status === 'COMPLETED'
      );
      setCourses(confirmedEnrollments);
      setFlagshipPrograms(Array.isArray(flagshipData) ? flagshipData : []);
      await loadProgressForCourses(confirmedEnrollments);
    } catch (error) {
      if (error.response?.status === 401) {
        showError('Session expired. Please login again.');
      } else {
        showError('Failed to refresh your courses');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUnenroll = async (courseId) => {
    try {
      await enrollmentService.unenroll(courseId);
      showSuccess('You have been unenrolled');
      reload();
    } catch (error) {
      if (error.response?.status === 401) {
        showError('Session expired. Please login again.');
      } else {
        showError('Failed to unenroll');
      }
    }
  };

  const handleUnenrollFlagship = async (programId) => {
    try {
      await flagshipService.unenroll(programId);
      showSuccess('You have been unenrolled');
      reload();
    } catch (error) {
      if (error.response?.status === 401) {
        showError('Session expired. Please login again.');
      } else {
        showError('Failed to unenroll');
      }
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading your courses..." />;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Breadcrumb items={[{ label: 'My Courses', path: ROUTES.MY_COURSES }]} />

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
          My Courses
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Continue where you left off or review completed courses.
        </Typography>
      </Box>

      {courses.length === 0 && flagshipPrograms.length === 0 ? (
        <EmptyState
          icon={SchoolIcon}
          title="No courses yet"
          description="You haven't enrolled in any courses yet. Start learning today!"
          actionLabel="Browse Courses"
          onAction={() => window.location.href = ROUTES.COURSES}
        />
      ) : (
        <>
          {/* Regular courses */}
          {courses.length > 0 && (
            <Grid container spacing={3}>
              {courses.map((item) => {
                const course = item.course ? item.course : item;
                const status = item.status || null;
                const isCompleted = status === 'COMPLETED';
                const prog = progressData[course.id] || { totalVideos: 0, completedVideos: 0, percent: 0 };
                return (
                  <Grid item xs={12} sm={6} md={4} key={course.id}>
                    <EnrolledCourseCard
                      course={course}
                      progress={isCompleted ? 100 : prog.percent}
                      completedVideos={prog.completedVideos}
                      totalVideos={prog.totalVideos}
                      onDownloadCertificate={handleDownloadCertificate}
                      certificateAvailable={isCompleted}
                      onUnenroll={() => handleUnenroll(course.id)}
                    />
                  </Grid>
                );
              })}
            </Grid>
          )}

          {/* Flagship programs */}
          {flagshipPrograms.length > 0 && (
            <Box sx={{ mt: courses.length > 0 ? 5 : 0 }}>
              {courses.length > 0 && <Divider sx={{ mb: 4 }} />}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <StarIcon sx={{ color: 'primary.main' }} />
                <Typography variant="h5" fontWeight={700}>
                  Flagship Programs
                </Typography>
              </Box>
              <Grid container spacing={3}>
                {flagshipPrograms.map((program) => {
                  const imgSrc = program.backgroundImageUrl
                    || (program.hasBackgroundImage
                        ? `${getApiBaseUrl()}/api/flagship/${program.id}/image`
                        : getImage('COURSE_PLACEHOLDER', IMAGES.COURSE_PLACEHOLDER));
                  return (
                    <Grid item xs={12} sm={6} md={4} key={program.id}>
                      <Card
                        sx={{
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          cursor: 'pointer',
                          '&:hover': { transform: 'translateY(-4px)', transition: 'transform 0.2s ease-in-out' },
                        }}
                        onClick={() => navigate(`/flagship/${program.id}`, { state: { mode: 'learn' } })}
                      >
                        <Box sx={{ position: 'relative' }}>
                          <CardMedia
                            component="img"
                            height={160}
                            image={imgSrc}
                            alt={program.title}
                            sx={{ objectFit: 'cover' }}
                          />
                          <Chip
                            label="Enrolled"
                            color="primary"
                            size="small"
                            icon={<StarIcon />}
                            sx={{ position: 'absolute', top: 8, right: 8 }}
                          />
                        </Box>
                        <CardContent sx={{ flex: 1 }}>
                          <Typography
                            variant="h6"
                            component="h3"
                            sx={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                            }}
                          >
                            {program.title}
                          </Typography>
                          {program.tagline && (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                              {program.tagline}
                            </Typography>
                          )}
                        </CardContent>
                        <CardActions sx={{ px: 2, pb: 2, flexDirection: 'column', gap: 1 }}>
                          <Button
                            variant="contained"
                            startIcon={<PlayCircleOutlineIcon />}
                            fullWidth
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/flagship/${program.id}`, { state: { mode: 'learn' } });
                            }}
                          >
                            Continue Learning
                          </Button>
                          {program.canDownloadCertificate && (
                            <Button
                              variant="outlined"
                              color="success"
                              startIcon={<DownloadIcon />}
                              fullWidth
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownloadFlagshipCertificate(program.id, program.title);
                              }}
                            >
                              Download Certificate
                            </Button>
                          )}
                          <Button
                            variant="text"
                            color="error"
                            size="small"
                            fullWidth
                            onClick={(e) => {
                              e.stopPropagation();
                              setUnenrollFlagshipTarget(program);
                            }}
                          >
                            Unenroll
                          </Button>
                        </CardActions>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          )}
        </>
      )}
      {/* Flagship unenroll confirmation dialog */}
      <Dialog
        open={!!unenrollFlagshipTarget}
        onClose={() => setUnenrollFlagshipTarget(null)}
        aria-labelledby="flagship-unenroll-dialog-title"
      >
        <DialogTitle id="flagship-unenroll-dialog-title">Unenroll from Program?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to unenroll from "{unenrollFlagshipTarget?.title}"? Your progress will be lost and you may need to pay again if it's a paid program.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUnenrollFlagshipTarget(null)}>Cancel</Button>
          <Button
            onClick={() => {
              const id = unenrollFlagshipTarget.id;
              setUnenrollFlagshipTarget(null);
              handleUnenrollFlagship(id);
            }}
            color="error"
            variant="contained"
          >
            Unenroll
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default MyCourses;
