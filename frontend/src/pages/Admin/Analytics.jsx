import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Grid, Paper, Tooltip, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { AdminLayout, StatCard } from '../../components/admin';
import { LoadingSpinner } from '../../components/common';
import { adminService } from '../../services';
import { useToast } from '../../store';
import { formatCurrency } from '../../utils/formatters';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PeopleIcon from '@mui/icons-material/People';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const PERIOD_OPTIONS = [
  { value: 'ALL', label: 'All Time' },
  { value: 'MONTH', label: 'This Month' },
  { value: 'QUARTER', label: 'Quarterly' },
  { value: 'HALF_YEAR', label: 'Half Year' },
  { value: 'YEAR', label: 'This Year' },
];

function getDateRange(period) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed
  const pad = (n) => String(n).padStart(2, '0');
  const toDate = `${year}-${pad(month + 1)}-${pad(now.getDate())}`;

  switch (period) {
    case 'MONTH':
      return { from: `${year}-${pad(month + 1)}-01`, to: toDate };
    case 'QUARTER': {
      const qStart = Math.floor(month / 3) * 3; // 0, 3, 6, 9
      return { from: `${year}-${pad(qStart + 1)}-01`, to: toDate };
    }
    case 'HALF_YEAR': {
      const d = new Date(year, month - 5, 1);
      return { from: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-01`, to: toDate };
    }
    case 'YEAR':
      return { from: `${year}-01-01`, to: toDate };
    default:
      return {};
  }
}

function getPeriodLabel(period) {
  switch (period) {
    case 'MONTH': return 'this month';
    case 'QUARTER': return 'this quarter';
    case 'HALF_YEAR': return 'the last 6 months';
    case 'YEAR': return 'this year';
    default: return 'the last 12 months';
  }
}

// Reusable bar chart component (CSS-based, no chart library)
function BarChart({ data = [], valueKey = 'count', labelKey = 'month', color = 'primary.main', formatValue }) {
  if (!data.length) return null;
  const values = data.map((d) => d[valueKey] || 0);
  const maxVal = Math.max(...values, 1);

  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: { xs: 0.25, md: 0.5 }, height: '100%', pt: 2, pb: 1 }}>
      {data.map((item, i) => {
        const val = item[valueKey] || 0;
        const barHeight = Math.max((val / maxVal) * 100, 2);
        const displayVal = formatValue ? formatValue(val) : val;
        const label = item[labelKey] || '';
        return (
          <Tooltip key={i} title={`${label}: ${displayVal}`} arrow placement="top">
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 0.5,
                height: '100%',
                justifyContent: 'flex-end',
                cursor: 'pointer',
                '&:hover .bar-fill': {
                  opacity: 0.85,
                  transform: 'scaleY(1.05)',
                },
              }}
            >
              <Typography
                variant="caption"
                sx={{ fontSize: '0.6rem', color: 'text.secondary', minHeight: 16, textAlign: 'center' }}
              >
                {val > 0 ? displayVal : ''}
              </Typography>
              <Box
                className="bar-fill"
                sx={{
                  width: '100%',
                  maxWidth: 40,
                  height: `${barHeight}%`,
                  bgcolor: val > 0 ? color : 'action.hover',
                  borderRadius: '4px 4px 0 0',
                  transition: 'height 0.6s ease, transform 0.2s ease, opacity 0.2s ease',
                  minHeight: 4,
                  transformOrigin: 'bottom',
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  fontSize: { xs: '0.5rem', md: '0.6rem' },
                  color: 'text.secondary',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: { xs: 28, md: 48 },
                  textAlign: 'center',
                }}
              >
                {label.split(' ')[0] || ''}
              </Typography>
            </Box>
          </Tooltip>
        );
      })}
    </Box>
  );
}

// Horizontal bar chart for popular courses
function HorizontalBarChart({ data = [], color = 'primary.main' }) {
  if (!data.length) return null;
  const maxVal = Math.max(...data.map((d) => d.enrollments), 1);

  return (
    <Box>
      {data.map((course, index) => (
        <Box key={index} sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
            <Typography variant="body2" noWrap sx={{ flex: 1, mr: 1 }} fontWeight={500}>
              {index + 1}. {course.name}
            </Typography>
            <Typography variant="body2" fontWeight={700} color={color}>
              {course.enrollments}
            </Typography>
          </Box>
          <Box
            sx={{
              height: 8,
              bgcolor: 'action.hover',
              borderRadius: 4,
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                height: '100%',
                width: `${(course.enrollments / maxVal) * 100}%`,
                bgcolor: color,
                borderRadius: 4,
                transition: 'width 1s ease',
              }}
            />
          </Box>
        </Box>
      ))}
    </Box>
  );
}

function AdminAnalytics() {
  const { showError } = useToast();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('ALL');

  useEffect(() => {
    let cancelled = false;
    const loadAnalytics = async () => {
      setLoading(true);
      try {
        const params = getDateRange(period);
        const data = await adminService.getAnalytics(params);
        if (!cancelled) setAnalytics(data);
      } catch (error) {
        if (!cancelled) {
          showError('Failed to load analytics');
          setAnalytics({
            totalUsers: 0,
            totalCourses: 0,
            totalRevenue: 0,
            totalEnrollments: 0,
            completedEnrollments: 0,
            pendingEnrollments: 0,
            monthlyEnrollments: [],
            popularCourses: [],
            revenueByMonth: [],
            userGrowth: [],
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadAnalytics();
    return () => { cancelled = true; };
  }, [period, showError]);

  const handlePeriodChange = (_, newPeriod) => {
    if (newPeriod !== null) {
      setPeriod(newPeriod);
    }
  };

  if (loading && !analytics) {
    return (
      <AdminLayout>
        <LoadingSpinner fullScreen text="Loading analytics..." />
      </AdminLayout>
    );
  }

  const periodLabel = getPeriodLabel(period);

  const summaryCards = [
    {
      title: 'Total Enrollments',
      value: analytics?.totalEnrollments || 0,
      icon: TrendingUpIcon,
      color: 'primary.main',
    },
    {
      title: 'Completed',
      value: analytics?.completedEnrollments || 0,
      icon: CheckCircleOutlineIcon,
      color: 'success.main',
    },
    {
      title: 'New Users',
      value: analytics?.totalUsers || 0,
      icon: PeopleIcon,
      color: 'info.main',
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(analytics?.totalRevenue || 0),
      icon: AttachMoneyIcon,
      color: 'warning.main',
    },
  ];

  const emptyState = (text) => (
    <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Typography variant="body2" color="text.secondary">
        {text}
      </Typography>
    </Box>
  );

  return (
    <AdminLayout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header with Filter */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'center' },
            flexDirection: { xs: 'column', md: 'row' },
            gap: 2,
            mb: 4,
          }}
        >
          <Box>
            <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
              Analytics
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Track your platform's performance and growth.
            </Typography>
          </Box>
          <ToggleButtonGroup
            value={period}
            exclusive
            onChange={handlePeriodChange}
            size="small"
            sx={{
              flexWrap: 'wrap',
              '& .MuiToggleButton-root': {
                px: { xs: 1, md: 1.5 },
                py: 0.5,
                fontSize: { xs: '0.7rem', md: '0.8rem' },
                textTransform: 'none',
              },
            }}
          >
            {PERIOD_OPTIONS.map((opt) => (
              <ToggleButton key={opt.value} value={opt.value}>
                {opt.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>

        {/* Loading overlay for filter changes */}
        <Box sx={{ position: 'relative', opacity: loading ? 0.5 : 1, transition: 'opacity 0.3s' }}>

        {/* Summary Cards */}
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
          {/* Enrollment Trends */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, height: 350, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" gutterBottom>
                Enrollment Trends
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
                Monthly enrollments for {periodLabel}
              </Typography>
              <Box sx={{ flex: 1 }}>
                {analytics?.monthlyEnrollments?.length > 0 ? (
                  <BarChart data={analytics.monthlyEnrollments} color="primary.main" />
                ) : (
                  emptyState('No enrollment data available')
                )}
              </Box>
            </Paper>
          </Grid>

          {/* Popular Courses */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: 350, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" gutterBottom>
                Popular Courses
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 2 }}>
                Top courses by enrollment count
              </Typography>
              <Box sx={{ flex: 1, overflow: 'auto' }}>
                {analytics?.popularCourses?.length > 0 ? (
                  <HorizontalBarChart data={analytics.popularCourses} color="primary.main" />
                ) : (
                  emptyState('No course data available')
                )}
              </Box>
            </Paper>
          </Grid>

          {/* Revenue by Month */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: 320, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" gutterBottom>
                Revenue by Month
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
                Monthly revenue for {periodLabel}
              </Typography>
              <Box sx={{ flex: 1 }}>
                {analytics?.revenueByMonth?.some((r) => r.revenue > 0) ? (
                  <BarChart
                    data={analytics.revenueByMonth}
                    valueKey="revenue"
                    color="warning.main"
                    formatValue={(v) => formatCurrency(v)}
                  />
                ) : (
                  emptyState('No revenue data available')
                )}
              </Box>
            </Paper>
          </Grid>

          {/* User Growth */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: 320, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" gutterBottom>
                User Growth
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
                New user registrations for {periodLabel}
              </Typography>
              <Box sx={{ flex: 1 }}>
                {analytics?.userGrowth?.some((u) => u.count > 0) ? (
                  <BarChart data={analytics.userGrowth} color="success.main" />
                ) : (
                  emptyState('No user growth data available')
                )}
              </Box>
            </Paper>
          </Grid>

          {/* Enrollment Breakdown */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Enrollment Breakdown
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h3" fontWeight={700} color="info.main">
                      {analytics?.totalEnrollments || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Active Enrollments
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h3" fontWeight={700} color="success.main">
                      {analytics?.completedEnrollments || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Completed
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h3" fontWeight={700} color="warning.main">
                      {analytics?.pendingEnrollments || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Pending
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
              {/* Visual bar for breakdown */}
              {(analytics?.totalEnrollments > 0 || analytics?.pendingEnrollments > 0) && (
                <Box sx={{ mt: 2 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      height: 12,
                      borderRadius: 6,
                      overflow: 'hidden',
                      bgcolor: 'action.hover',
                    }}
                  >
                    {analytics?.completedEnrollments > 0 && (
                      <Tooltip title={`Completed: ${analytics.completedEnrollments}`}>
                        <Box
                          sx={{
                            width: `${(analytics.completedEnrollments / (analytics.totalEnrollments + analytics.pendingEnrollments)) * 100}%`,
                            bgcolor: 'success.main',
                            transition: 'width 1s ease',
                          }}
                        />
                      </Tooltip>
                    )}
                    {(analytics?.totalEnrollments - analytics?.completedEnrollments) > 0 && (
                      <Tooltip title={`Active: ${analytics.totalEnrollments - analytics.completedEnrollments}`}>
                        <Box
                          sx={{
                            width: `${((analytics.totalEnrollments - analytics.completedEnrollments) / (analytics.totalEnrollments + analytics.pendingEnrollments)) * 100}%`,
                            bgcolor: 'info.main',
                            transition: 'width 1s ease',
                          }}
                        />
                      </Tooltip>
                    )}
                    {analytics?.pendingEnrollments > 0 && (
                      <Tooltip title={`Pending: ${analytics.pendingEnrollments}`}>
                        <Box
                          sx={{
                            width: `${(analytics.pendingEnrollments / (analytics.totalEnrollments + analytics.pendingEnrollments)) * 100}%`,
                            bgcolor: 'warning.main',
                            transition: 'width 1s ease',
                          }}
                        />
                      </Tooltip>
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', gap: 3, mt: 1, justifyContent: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'success.main' }} />
                      <Typography variant="caption" color="text.secondary">Completed</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'info.main' }} />
                      <Typography variant="caption" color="text.secondary">Active</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'warning.main' }} />
                      <Typography variant="caption" color="text.secondary">Pending</Typography>
                    </Box>
                  </Box>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>

        </Box>
      </Container>
    </AdminLayout>
  );
}

export default AdminAnalytics;
