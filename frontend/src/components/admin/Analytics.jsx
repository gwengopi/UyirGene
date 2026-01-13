import React from 'react';
import { Box, Grid, Typography, Card, CardContent, Divider } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PaymentIcon from '@mui/icons-material/Payment';
import StatCard from './StatCard';
import { formatCurrency, formatNumber } from '../../utils/formatters';

/**
 * Analytics Dashboard component
 */
function Analytics({ data = {}, loading = false }) {
  const {
    totalUsers = 0,
    totalCourses = 0,
    totalEnrollments = 0,
    totalRevenue = 0,
    newUsersThisMonth = 0,
    newEnrollmentsThisMonth = 0,
    coursesByCategory = [],
    recentEnrollments = [],
  } = data;

  return (
    <Box>
      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Users"
            value={formatNumber(totalUsers)}
            icon={<PeopleIcon />}
            color="primary"
            trend="up"
            trendValue={`+${newUsersThisMonth}`}
            subtitle="this month"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Courses"
            value={formatNumber(totalCourses)}
            icon={<SchoolIcon />}
            color="info"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Enrollments"
            value={formatNumber(totalEnrollments)}
            icon={<TrendingUpIcon />}
            color="success"
            trend="up"
            trendValue={`+${newEnrollmentsThisMonth}`}
            subtitle="this month"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Revenue"
            value={formatCurrency(totalRevenue)}
            icon={<PaymentIcon />}
            color="warning"
            loading={loading}
          />
        </Grid>
      </Grid>

      {/* Additional Analytics */}
      <Grid container spacing={3}>
        {/* Courses by Category */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Courses by Category
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {coursesByCategory.length > 0 ? (
                <Box>
                  {coursesByCategory.map((item, index) => (
                    <Box
                      key={item.category}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        py: 1,
                        borderBottom: index < coursesByCategory.length - 1 ? 1 : 0,
                        borderColor: 'divider',
                      }}
                    >
                      <Typography variant="body2">{item.category}</Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {item.count} courses
                      </Typography>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  No data available
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Enrollments */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Enrollments
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {recentEnrollments.length > 0 ? (
                <Box>
                  {recentEnrollments.slice(0, 5).map((enrollment, index) => (
                    <Box
                      key={enrollment.id}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        py: 1,
                        borderBottom: index < 4 ? 1 : 0,
                        borderColor: 'divider',
                      }}
                    >
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {enrollment.userName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {enrollment.courseName}
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {enrollment.date}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  No recent enrollments
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Analytics;
