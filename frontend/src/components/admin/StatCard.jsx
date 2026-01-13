import React from 'react';
import { Card, CardContent, Typography, Box, Skeleton } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

/**
 * Statistics Card for dashboard
 */
function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
  color = 'primary',
  loading = false,
}) {
  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <Box>
              <Skeleton variant="text" width={100} />
              <Skeleton variant="text" width={80} height={48} />
              <Skeleton variant="text" width={120} />
            </Box>
            <Skeleton variant="circular" width={48} height={48} />
          </Box>
        </CardContent>
      </Card>
    );
  }

  const isPositiveTrend = trend === 'up';
  const TrendIcon = isPositiveTrend ? TrendingUpIcon : TrendingDownIcon;

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight={700} color={`${color}.main`}>
              {value}
            </Typography>
            {(subtitle || trendValue) && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                {trendValue && (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      color: isPositiveTrend ? 'success.main' : 'error.main',
                    }}
                  >
                    <TrendIcon fontSize="small" />
                    <Typography variant="body2" fontWeight={500}>
                      {trendValue}
                    </Typography>
                  </Box>
                )}
                {subtitle && (
                  <Typography variant="body2" color="text.secondary">
                    {subtitle}
                  </Typography>
                )}
              </Box>
            )}
          </Box>
          {icon && (
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                backgroundColor: `${color}.main`,
                color: `${color}.contrastText`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {/* Render icon - handle both component and element */}
              {React.isValidElement(icon) ? icon : React.createElement(icon)}
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

export default StatCard;
