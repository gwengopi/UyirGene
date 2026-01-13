import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Grid, Typography, Box, Paper } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { Button, Breadcrumb, LoadingSpinner } from '../components/common';
import { ProfileCard } from '../components/user';
import { CourseCard } from '../components/course';
import { enrollmentService } from '../services';
import { useAuth, useToast } from '../store';
import { ROUTES } from '../utils/constants';

function Dashboard() {
  const navigate = useNavigate();
  const { user, isAdmin, isInstructor } = useAuth();
  const { showError } = useToast();

  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const courses = await enrollmentService.getEnrolledCourses();
        setEnrolledCourses(courses);
      } catch (error) {
        showError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [showError]);

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading dashboard..." />;
  }

  const stats = {
    enrolledCourses: enrolledCourses.length,
    completedCourses: 0, // Would need to track this from backend
  };

  const recentCourses = enrolledCourses.slice(0, 3);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Breadcrumb items={[{ label: 'Dashboard', path: ROUTES.DASHBOARD }]} />

      <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
        Welcome back, {user?.name?.split(' ')[0] || 'User'}!
      </Typography>

      <Grid container spacing={4}>
        {/* Profile Card */}
        <Grid item xs={12} md={4}>
          <ProfileCard
            user={user}
            stats={stats}
            onEditProfile={() => navigate(ROUTES.PROFILE)}
          />

          {/* Quick Actions */}
          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                variant="contained"
                fullWidth
                startIcon={<SchoolIcon />}
                onClick={() => navigate(ROUTES.COURSES)}
              >
                Browse Courses
              </Button>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<TrendingUpIcon />}
                onClick={() => navigate(ROUTES.MY_COURSES)}
              >
                My Learning
              </Button>
              {isAdmin() && (
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => navigate(ROUTES.ADMIN.HOME)}
                >
                  Admin Panel
                </Button>
              )}
              {isInstructor() && (
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => navigate(ROUTES.ADMIN.COURSES)}
                >
                  Manage Courses
                </Button>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Main Content */}
        <Grid item xs={12} md={8}>
          {/* Continue Learning */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Continue Learning</Typography>
              {enrolledCourses.length > 3 && (
                <Button variant="text" onClick={() => navigate(ROUTES.MY_COURSES)}>
                  View All
                </Button>
              )}
            </Box>

            {recentCourses.length > 0 ? (
              <Grid container spacing={2}>
                {recentCourses.map((course) => (
                  <Grid item xs={12} sm={6} md={4} key={course.id}>
                    <CourseCard course={course} isEnrolled />
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="text.secondary" gutterBottom>
                  You haven't enrolled in any courses yet
                </Typography>
                <Button variant="contained" onClick={() => navigate(ROUTES.COURSES)}>
                  Explore Courses
                </Button>
              </Box>
            )}
          </Paper>

          {/* Activity Summary */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Your Progress Summary
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={6}>
                <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'background.default', borderRadius: 1 }}>
                  <Typography variant="h3" color="primary" fontWeight={600}>
                    {stats.enrolledCourses}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Courses Enrolled
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'background.default', borderRadius: 1 }}>
                  <Typography variant="h3" color="success.main" fontWeight={600}>
                    {stats.completedCourses}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Courses Completed
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Dashboard;
