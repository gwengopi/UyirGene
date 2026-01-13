import React, { useState, useEffect } from 'react';
import { Container, Grid, Typography, Box } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { AdminLayout, StatCard } from '../../components/admin';
import { LoadingSpinner } from '../../components/common';
import { adminService } from '../../services';
import { useToast } from '../../store';
import { formatCurrency } from '../../utils/formatters';

function AdminDashboard() {
  const { showError } = useToast();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await adminService.getAnalytics();
        setStats(data);
      } catch (error) {
        showError('Failed to load dashboard stats');
        // Set default stats on error
        setStats({
          totalUsers: 0,
          totalCourses: 0,
          totalRevenue: 0,
          totalEnrollments: 0,
          recentEnrollments: [],
        });
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [showError]);

  if (loading) {
    return (
      <AdminLayout>
        <LoadingSpinner fullScreen text="Loading dashboard..." />
      </AdminLayout>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: PeopleIcon,
      color: 'primary.main',
      trend: '+12%',
      trendUp: true,
    },
    {
      title: 'Total Courses',
      value: stats?.totalCourses || 0,
      icon: SchoolIcon,
      color: 'success.main',
      trend: '+5%',
      trendUp: true,
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(stats?.totalRevenue || 0),
      icon: AttachMoneyIcon,
      color: 'warning.main',
      trend: '+18%',
      trendUp: true,
    },
    {
      title: 'Enrollments',
      value: stats?.totalEnrollments || 0,
      icon: TrendingUpIcon,
      color: 'info.main',
      trend: '+8%',
      trendUp: true,
    },
  ];

  return (
    <AdminLayout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
          Admin Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Welcome back! Here's an overview of your platform.
        </Typography>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          {statCards.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <StatCard
                title={stat.title}
                value={stat.value}
                icon={stat.icon}
                color={stat.color}
                trend={stat.trend}
                trendUp={stat.trendUp}
              />
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Box
              sx={{
                p: 3,
                bgcolor: 'background.paper',
                borderRadius: 2,
                height: 300,
              }}
            >
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Activity chart will be displayed here
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box
              sx={{
                p: 3,
                bgcolor: 'background.paper',
                borderRadius: 2,
                height: 300,
              }}
            >
              <Typography variant="h6" gutterBottom>
                Recent Enrollments
              </Typography>
              {stats?.recentEnrollments?.length > 0 ? (
                stats.recentEnrollments.map((enrollment, index) => (
                  <Box key={index} sx={{ py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="body2">{enrollment.userName}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {enrollment.courseName}
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No recent enrollments
                </Typography>
              )}
            </Box>
          </Grid>
        </Grid>
      </Container>
    </AdminLayout>
  );
}

export default AdminDashboard;
