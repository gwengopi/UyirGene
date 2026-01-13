import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Grid, Paper } from '@mui/material';
import { AdminLayout, Analytics as AnalyticsComponent, StatCard } from '../../components/admin';
import { LoadingSpinner } from '../../components/common';
import { adminService } from '../../services';
import { useToast } from '../../store';
import { formatCurrency } from '../../utils/formatters';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

function AdminAnalytics() {
  const { showError } = useToast();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const data = await adminService.getAnalytics();
        setAnalytics(data);
      } catch (error) {
        showError('Failed to load analytics');
        setAnalytics({
          totalUsers: 0,
          totalCourses: 0,
          totalRevenue: 0,
          totalEnrollments: 0,
          monthlyEnrollments: [],
          popularCourses: [],
          revenueByMonth: [],
        });
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [showError]);

  if (loading) {
    return (
      <AdminLayout>
        <LoadingSpinner fullScreen text="Loading analytics..." />
      </AdminLayout>
    );
  }

  const summaryCards = [
    {
      title: 'Total Enrollments',
      value: analytics?.totalEnrollments || 0,
      icon: TrendingUpIcon,
      color: 'primary.main',
    },
    {
      title: 'Active Users',
      value: analytics?.totalUsers || 0,
      icon: PeopleIcon,
      color: 'success.main',
    },
    {
      title: 'Published Courses',
      value: analytics?.totalCourses || 0,
      icon: SchoolIcon,
      color: 'info.main',
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(analytics?.totalRevenue || 0),
      icon: AttachMoneyIcon,
      color: 'warning.main',
    },
  ];

  return (
    <AdminLayout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
            Analytics
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Track your platform's performance and growth.
          </Typography>
        </Box>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          {summaryCards.map((card, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <StatCard
                title={card.title}
                value={card.value}
                icon={card.icon}
                color={card.color}
              />
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, height: 350 }}>
              <Typography variant="h6" gutterBottom>
                Enrollment Trends
              </Typography>
              <Box sx={{
                height: 280,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'text.secondary'
              }}>
                {analytics?.monthlyEnrollments?.length > 0 ? (
                  <AnalyticsComponent data={analytics} />
                ) : (
                  <Typography>No enrollment data available</Typography>
                )}
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: 350 }}>
              <Typography variant="h6" gutterBottom>
                Popular Courses
              </Typography>
              <Box sx={{ overflow: 'auto', maxHeight: 280 }}>
                {analytics?.popularCourses?.length > 0 ? (
                  analytics.popularCourses.map((course, index) => (
                    <Box
                      key={index}
                      sx={{
                        py: 1.5,
                        borderBottom: index < analytics.popularCourses.length - 1 ? '1px solid' : 'none',
                        borderColor: 'divider',
                      }}
                    >
                      <Typography variant="body2" fontWeight={500}>
                        {index + 1}. {course.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {course.enrollments} enrollments
                      </Typography>
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No course data available
                  </Typography>
                )}
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: 300 }}>
              <Typography variant="h6" gutterBottom>
                Revenue by Month
              </Typography>
              <Box sx={{
                height: 230,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'text.secondary'
              }}>
                {analytics?.revenueByMonth?.length > 0 ? (
                  <Typography>Revenue chart placeholder</Typography>
                ) : (
                  <Typography>No revenue data available</Typography>
                )}
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: 300 }}>
              <Typography variant="h6" gutterBottom>
                User Growth
              </Typography>
              <Box sx={{
                height: 230,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'text.secondary'
              }}>
                <Typography>User growth chart placeholder</Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </AdminLayout>
  );
}

export default AdminAnalytics;
