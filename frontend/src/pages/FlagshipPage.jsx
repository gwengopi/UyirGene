import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Box, CircularProgress, Alert } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import { Breadcrumb, SEO } from '../components/common';
import { CourseList } from '../components/course';
import { courseService, enrollmentService } from '../services';
import { useAuth, useToast } from '../store';
import { ROUTES } from '../utils/constants';

function FlagshipPage() {
  const { isAuthenticated } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [enrolledIds, setEnrolledIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enrollingId, setEnrollingId] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await courseService.getFlagshipCourses();
        setCourses(data);

        if (isAuthenticated()) {
          try {
            const enrolled = await enrollmentService.getEnrolledCourses();
            const confirmed = enrolled.filter(
              (e) => e.status === 'ENROLLED' || e.status === 'COMPLETED'
            );
            setEnrolledIds(confirmed.map((e) => e.course?.id || e.id));
          } catch {
            // Non-critical
          }
        }
      } catch {
        setError('Failed to load flagship courses.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isAuthenticated]);

  const handleEnroll = useCallback(
    async (courseId) => {
      if (!isAuthenticated()) {
        showError('Please login to enroll in courses');
        return;
      }
      if (enrolledIds.includes(courseId)) {
        showError('You are already enrolled in this course');
        return;
      }
      setEnrollingId(courseId);
      try {
        const result = await enrollmentService.startEnrollment(courseId);
        const order = result && (result.order ? result.order : result.orderId ? result : null);
        if (order) {
          navigate(ROUTES.PAYMENT, {
            state: {
              courseId,
              courseName: courses.find((c) => c.id === courseId)?.title,
              order,
            },
          });
          return;
        }
        setEnrolledIds((prev) => [...prev, courseId]);
        showSuccess('Successfully enrolled in the course!');
      } catch (err) {
        if (err.message === 'Payment cancelled') return;
        if (err.response?.status === 401) {
          showError('Session expired. Please login again.');
        } else {
          showError(err.message || 'Failed to enroll');
        }
      } finally {
        setEnrollingId(null);
      }
    },
    [isAuthenticated, enrolledIds, courses, showSuccess, showError, navigate]
  );

  const breadcrumbItems = [
    { label: 'Courses', path: ROUTES.COURSES },
    { label: 'Flagship Programs' },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <SEO
        title="Flagship Programs"
        description="Explore our most comprehensive and industry-recognised certification programs at Uyirgene International."
        path="/courses/flagship"
      />
      <Breadcrumb items={breadcrumbItems} />

      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <StarIcon sx={{ color: '#7B2D8B', fontSize: 32 }} />
        <Box>
          <Typography variant="h4" component="h1" fontWeight={700}>
            Flagship Programs
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Our most comprehensive and industry-recognised certification programs.
          </Typography>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <CourseList
          courses={courses}
          enrolledIds={enrolledIds}
          onEnroll={handleEnroll}
          loading={loading}
          enrollingId={enrollingId}
          emptyTitle="No flagship courses available"
          emptyDescription="Check back later for new flagship programs."
        />
      )}
    </Container>
  );
}

export default FlagshipPage;
