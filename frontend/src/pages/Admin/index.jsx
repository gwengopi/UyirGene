import React, { useState, useEffect } from 'react';
import { Container, Grid, Typography, Box, Chip, Avatar } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { AdminLayout, StatCard } from '../../components/admin';
import { LoadingSpinner } from '../../components/common';
import { adminService } from '../../services';
import { useToast } from '../../store';
import { formatCurrency } from '../../utils/formatters';

function formatRelativeTime(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function MiniBarChart({ data = [], label }) {
  if (!data.length) return null;
  const maxVal = Math.max(...data.map((d) => d.count), 1);
  return (
    <Box>
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>
        {label}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 0.5, height: 150 }}>
        {data.map((item, i) => (
          <Box
            key={i}
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 0.5,
            }}
          >
            <Typography
              variant="caption"
              sx={{ fontSize: '0.6rem', color: 'text.secondary', minHeight: 16 }}
            >
              {item.count > 0 ? item.count : ''}
            </Typography>
            <Box
              sx={{
                width: '100%',
                maxWidth: 32,
                height: `${Math.max((item.count / maxVal) * 120, 4)}px`,
                bgcolor: item.count > 0 ? 'primary.main' : 'action.hover',
                borderRadius: '4px 4px 0 0',
                transition: 'height 0.5s ease',
                minHeight: 4,
              }}
            />
            <Typography
              variant="caption"
              sx={{
                fontSize: '0.55rem',
                color: 'text.secondary',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: 40,
              }}
            >
              {item.month?.split(' ')[0] || ''}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

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
        setStats({
          totalUsers: 0,
          totalCourses: 0,
          totalRevenue: 0,
          totalEnrollments: 0,
          recentEnrollments: [],
          monthlyEnrollments: [],
          popularCourses: [],
          userGrowth: [],
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
    },
    {
      title: 'Total Courses',
      value: stats?.totalCourses || 0,
      icon: SchoolIcon,
      color: 'success.main',
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(stats?.totalRevenue || 0),
      icon: AttachMoneyIcon,
      color: 'warning.main',
    },
    {
      title: 'Enrollments',
      value: stats?.totalEnrollments || 0,
      icon: TrendingUpIcon,
      color: 'info.main',
    },
  ];

  const statusColor = {
    ENROLLED: 'info',
    COMPLETED: 'success',
    PENDING: 'warning',
  };

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
              />
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={3}>
          {/* Enrollment Trend mini chart */}
          <Grid item xs={12} md={8}>
            <Box
              sx={{
                p: 3,
                bgcolor: 'background.paper',
                borderRadius: 2,
                height: 300,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              {stats?.monthlyEnrollments?.length > 0 ? (
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <MiniBarChart data={stats.monthlyEnrollments} label="Monthly Enrollments (Last 12 Months)" />
                </Box>
              ) : (
                <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    No enrollment data available yet
                  </Typography>
                </Box>
              )}
            </Box>
          </Grid>

          {/* Recent Enrollments with better UI */}
          <Grid item xs={12} md={4}>
            <Box
              sx={{
                p: 3,
                bgcolor: 'background.paper',
                borderRadius: 2,
                height: 300,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Typography variant="h6" gutterBottom>
                Recent Enrollments
              </Typography>
              {stats?.recentEnrollments?.length > 0 ? (
                <Box sx={{ flex: 1, overflow: 'auto' }}>
                  {stats.recentEnrollments.map((enrollment, index) => (
                    <Box
                      key={index}
                      sx={{
                        py: 1.5,
                        borderBottom: index < stats.recentEnrollments.length - 1 ? '1px solid' : 'none',
                        borderColor: 'divider',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          bgcolor: enrollment.status === 'COMPLETED' ? 'success.main' : 'primary.main',
                          fontSize: '0.8rem',
                        }}
                      >
                        {enrollment.status === 'COMPLETED' ? (
                          <CheckCircleIcon sx={{ fontSize: 18 }} />
                        ) : (
                          <PersonAddIcon sx={{ fontSize: 18 }} />
                        )}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" noWrap fontWeight={500}>
                          {enrollment.userName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                          {enrollment.courseName}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                        <Chip
                          label={enrollment.status}
                          size="small"
                          color={statusColor[enrollment.status] || 'default'}
                          sx={{ fontSize: '0.6rem', height: 20, mb: 0.5 }}
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.6rem' }}>
                          {formatRelativeTime(enrollment.enrolledAt)}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    No recent enrollments
                  </Typography>
                </Box>
              )}
            </Box>
          </Grid>

          {/* Popular Courses */}
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                p: 3,
                bgcolor: 'background.paper',
                borderRadius: 2,
                height: 280,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Typography variant="h6" gutterBottom>
                Popular Courses
              </Typography>
              {stats?.popularCourses?.length > 0 ? (
                <Box sx={{ flex: 1, overflow: 'auto' }}>
                  {stats.popularCourses.map((course, index) => {
                    const maxEnroll = stats.popularCourses[0]?.enrollments || 1;
                    return (
                      <Box key={index} sx={{ mb: 1.5 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="body2" noWrap sx={{ flex: 1, mr: 1 }}>
                            {index + 1}. {course.name}
                          </Typography>
                          <Typography variant="body2" fontWeight={600} color="primary.main">
                            {course.enrollments}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            height: 6,
                            bgcolor: 'action.hover',
                            borderRadius: 3,
                            overflow: 'hidden',
                          }}
                        >
                          <Box
                            sx={{
                              height: '100%',
                              width: `${(course.enrollments / maxEnroll) * 100}%`,
                              bgcolor: 'primary.main',
                              borderRadius: 3,
                              transition: 'width 0.8s ease',
                            }}
                          />
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              ) : (
                <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    No course data available
                  </Typography>
                </Box>
              )}
            </Box>
          </Grid>

          {/* User Growth mini chart */}
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                p: 3,
                bgcolor: 'background.paper',
                borderRadius: 2,
                height: 280,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Typography variant="h6" gutterBottom>
                User Growth
              </Typography>
              {stats?.userGrowth?.length > 0 ? (
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <MiniBarChart data={stats.userGrowth} label="New Users per Month (Last 12 Months)" />
                </Box>
              ) : (
                <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    No user growth data available
                  </Typography>
                </Box>
              )}
            </Box>
          </Grid>
        </Grid>
      </Container>
    </AdminLayout>
  );
}

export default AdminDashboard;
