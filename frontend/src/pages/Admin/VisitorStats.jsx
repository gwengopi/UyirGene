import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Box, Grid, Paper, Tooltip,
  ToggleButton, ToggleButtonGroup,
} from '@mui/material';
import { AdminLayout, StatCard } from '../../components/admin';
import { LoadingSpinner } from '../../components/common';
import { useToast } from '../../store';
import api from '../../services/api';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PageviewIcon from '@mui/icons-material/Pageview';
import ComputerIcon from '@mui/icons-material/Computer';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import TabletIcon from '@mui/icons-material/Tablet';

const PERIOD_OPTIONS = [
  { value: 'DAY',   label: 'Today' },
  { value: 'WEEK',  label: 'This Week' },
  { value: 'MONTH', label: 'This Month' },
  { value: 'YEAR',  label: 'This Year' },
];

const PERIOD_DAYS = { DAY: 1, WEEK: 7, MONTH: 30, YEAR: 365 };

// ── CSS-based vertical bar chart ─────────────────────────────────────────────
function BarChart({ data = [], color = 'primary.main' }) {
  if (!data.length) return null;
  const maxVal = Math.max(...data.map((d) => d.count), 1);

  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: { xs: 0.25, md: 0.5 }, height: '100%', pt: 2, pb: 1 }}>
      {data.map((item, i) => {
        const val = item.count || 0;
        const barHeight = Math.max((val / maxVal) * 100, 2);
        const label = item.date ? item.date.slice(5) : ''; // MM-DD
        return (
          <Tooltip key={i} title={`${item.date}: ${val} visits`} arrow placement="top">
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
                '&:hover .bar-fill': { opacity: 0.85, transform: 'scaleY(1.05)' },
              }}
            >
              <Typography variant="caption" sx={{ fontSize: '0.6rem', color: 'text.secondary', minHeight: 16, textAlign: 'center' }}>
                {val > 0 ? val : ''}
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
                {label}
              </Typography>
            </Box>
          </Tooltip>
        );
      })}
    </Box>
  );
}

// ── Horizontal bar chart for top pages ───────────────────────────────────────
function TopPagesChart({ data = [], color = 'primary.main' }) {
  if (!data.length) return null;
  const maxVal = Math.max(...data.map((d) => d.count), 1);

  return (
    <Box>
      {data.map((page, index) => (
        <Box key={index} sx={{ mb: 1.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
            <Box sx={{ flex: 1, mr: 1, minWidth: 0 }}>
              <Typography variant="body2" noWrap sx={{ fontSize: '0.85rem', fontWeight: page.label ? 500 : 400 }}>
                {index + 1}. {page.label || page.path}
              </Typography>
              {page.label && (
                <Typography variant="caption" noWrap display="block" sx={{ color: 'text.secondary', fontFamily: 'monospace', fontSize: '0.7rem' }}>
                  {page.path}
                </Typography>
              )}
            </Box>
            <Typography variant="body2" fontWeight={700} color={color}>
              {page.count}
            </Typography>
          </Box>
          <Box sx={{ height: 6, bgcolor: 'action.hover', borderRadius: 3, overflow: 'hidden' }}>
            <Box
              sx={{
                height: '100%',
                width: `${(page.count / maxVal) * 100}%`,
                bgcolor: color,
                borderRadius: 3,
                transition: 'width 1s ease',
              }}
            />
          </Box>
        </Box>
      ))}
    </Box>
  );
}

// ── Device breakdown ──────────────────────────────────────────────────────────
function DeviceBreakdown({ breakdown }) {
  if (!breakdown) return null;
  const { desktop = 0, mobile = 0, tablet = 0 } = breakdown;
  const total = desktop + mobile + tablet || 1;

  const segments = [
    { label: 'Desktop', value: desktop, color: 'primary.main', icon: <ComputerIcon fontSize="small" /> },
    { label: 'Mobile',  value: mobile,  color: 'success.main', icon: <PhoneAndroidIcon fontSize="small" /> },
    { label: 'Tablet',  value: tablet,  color: 'warning.main', icon: <TabletIcon fontSize="small" /> },
  ];

  return (
    <Box>
      {/* Stacked bar */}
      <Box sx={{ display: 'flex', height: 14, borderRadius: 7, overflow: 'hidden', bgcolor: 'action.hover', mb: 2 }}>
        {segments.map(({ label, value, color }) =>
          value > 0 ? (
            <Tooltip key={label} title={`${label}: ${value}`}>
              <Box
                sx={{
                  width: `${(value / total) * 100}%`,
                  bgcolor: color,
                  transition: 'width 1s ease',
                }}
              />
            </Tooltip>
          ) : null
        )}
      </Box>
      {/* Legend */}
      <Grid container spacing={2}>
        {segments.map(({ label, value, color, icon }) => (
          <Grid item xs={4} key={label}>
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 0.5, color }}>
                {icon}
                <Typography variant="h5" fontWeight={700} color={color}>{value}</Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">{label}</Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                {total > 0 ? `${Math.round((value / total) * 100)}%` : '0%'}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
function VisitorStats() {
  const { showError } = useToast();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('MONTH');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/api/analytics/admin/visitors', { params: { period } });
        if (!cancelled) setStats(data);
      } catch {
        if (!cancelled) showError('Failed to load visitor stats');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [period, showError]);

  const handlePeriodChange = (_, val) => { if (val) setPeriod(val); };

  if (loading && !stats) {
    return (
      <AdminLayout>
        <LoadingSpinner fullScreen text="Loading visitor stats..." />
      </AdminLayout>
    );
  }

  const days = PERIOD_DAYS[period] || 30;
  const avgDaily = stats?.totalVisits ? Math.round(stats.totalVisits / days) : 0;
  const mostVisited = stats?.topPages?.[0]?.label || stats?.topPages?.[0]?.path || '—';

  const summaryCards = [
    { title: 'Total Visits',      value: stats?.totalVisits    || 0, icon: VisibilityIcon,  color: 'primary.main' },
    { title: 'Unique Visitors',   value: stats?.uniqueVisitors || 0, icon: PeopleAltIcon,   color: 'success.main' },
    { title: 'Most Visited Page', value: mostVisited,               icon: PageviewIcon,     color: 'info.main'    },
    { title: 'Avg Daily Visits',  value: avgDaily,                  icon: TrendingUpIcon,   color: 'warning.main' },
  ];

  const emptyState = (text) => (
    <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Typography variant="body2" color="text.secondary">{text}</Typography>
    </Box>
  );

  return (
    <AdminLayout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
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
              Visitor Stats
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Page-view tracking — no third-party services, no IP addresses stored.
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
              <ToggleButton key={opt.value} value={opt.value}>{opt.label}</ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>

        <Box sx={{ position: 'relative', opacity: loading ? 0.5 : 1, transition: 'opacity 0.3s' }}>
          {/* Summary Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {summaryCards.map((card, i) => (
              <Grid item xs={12} sm={6} md={3} key={i}>
                <StatCard title={card.title} value={card.value} icon={card.icon} color={card.color} />
              </Grid>
            ))}
          </Grid>

          <Grid container spacing={3}>
            {/* Daily Visits Chart */}
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 3, height: 350, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" gutterBottom>Daily Visits</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
                  Page views per day for the selected period
                </Typography>
                <Box sx={{ flex: 1 }}>
                  {stats?.dailyChart?.length > 0
                    ? <BarChart data={stats.dailyChart} color="primary.main" />
                    : emptyState('No visit data yet')}
                </Box>
              </Paper>
            </Grid>

            {/* Device Breakdown */}
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, height: 350, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" gutterBottom>Device Types</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 2 }}>
                  Visitor breakdown by device category
                </Typography>
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  {stats?.deviceBreakdown
                    ? <DeviceBreakdown breakdown={stats.deviceBreakdown} />
                    : emptyState('No device data yet')}
                </Box>
              </Paper>
            </Grid>

            {/* Top Pages */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Top Pages</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                  Most visited pages in the selected period
                </Typography>
                {stats?.topPages?.length > 0
                  ? <TopPagesChart data={stats.topPages} color="primary.main" />
                  : <Typography variant="body2" color="text.secondary">No page data yet</Typography>}
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </AdminLayout>
  );
}

export default VisitorStats;
