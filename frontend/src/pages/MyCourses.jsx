import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Typography, Box, Grid,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
} from '@mui/material';
import { Breadcrumb, LoadingSpinner, EmptyState, Button } from '../components/common';
import { EnrolledCourseCard } from '../components/user';
import { enrollmentService, certificateService, courseService, videoService } from '../services';
import { useToast, useConfig } from '../store';
import { ROUTES, IMAGES } from '../utils/constants';
import SchoolIcon from '@mui/icons-material/School';

function MyCourses() {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const { getImage } = useConfig();
  const [courses, setCourses] = useState([]);
  const [progressData, setProgressData] = useState({});
  const [loading, setLoading] = useState(true);
  const [certificateErrorOpen, setCertificateErrorOpen] = useState(false);
  const [certificateError, setCertificateError] = useState('');

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const data = await enrollmentService.getEnrolledCourses();
        // Only show courses with ENROLLED or COMPLETED status (not PENDING)
        const confirmedEnrollments = data.filter(
          (e) => e.status === 'ENROLLED' || e.status === 'COMPLETED'
        );
        setCourses(confirmedEnrollments);
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
      const data = await enrollmentService.getEnrolledCourses();
      const confirmedEnrollments = data.filter(
        (e) => e.status === 'ENROLLED' || e.status === 'COMPLETED'
      );
      setCourses(confirmedEnrollments);
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

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading your courses..." />;
  }

  return (
    <>
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

      {courses.length === 0 ? (
        <EmptyState
          icon={SchoolIcon}
          title="No courses yet"
          description="You haven't enrolled in any courses yet. Start learning today!"
          actionLabel="Browse Courses"
          onAction={() => window.location.href = ROUTES.COURSES}
        />
      ) : (
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
    </Container>

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
    </>
  );
}

export default MyCourses;
