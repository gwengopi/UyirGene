import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Grid } from '@mui/material';
import { Breadcrumb, LoadingSpinner, EmptyState } from '../components/common';
import { EnrolledCourseCard } from '../components/user';
import { enrollmentService, certificateService } from '../services';
import { useToast } from '../store';
import { ROUTES } from '../utils/constants';
import SchoolIcon from '@mui/icons-material/School';

function MyCourses() {
  const { showSuccess, showError } = useToast();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const data = await enrollmentService.getEnrolledCourses();
        setCourses(data);
      } catch (error) {
        showError('Failed to load your courses');
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

  const reload = async () => {
    setLoading(true);
    try {
      const data = await enrollmentService.getEnrolledCourses();
      setCourses(data);
    } catch (error) {
      showError('Failed to refresh your courses');
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
      showError('Failed to unenroll');
    }
  };

  const handleMarkComplete = async (courseId) => {
    try {
      await enrollmentService.markComplete(courseId);
      showSuccess('Course marked as completed');
      reload();
    } catch (error) {
      showError('Failed to mark as completed');
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
            const isCompleted = status === 'COMPLETED' || status === 'COMPLETED';
            return (
              <Grid item xs={12} sm={6} md={4} key={course.id}>
                <EnrolledCourseCard
                  course={course}
                  progress={isCompleted ? 100 : 0}
                  completedVideos={0}
                  totalVideos={0}
                  onDownloadCertificate={handleDownloadCertificate}
                  certificateAvailable={isCompleted}
                  onUnenroll={() => handleUnenroll(course.id)}
                  onMarkComplete={() => handleMarkComplete(course.id)}
                />
              </Grid>
            );
          })}
        </Grid>
      )}
    </Container>
  );
}

export default MyCourses;
