import React, { useState } from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SchoolIcon from '@mui/icons-material/School';
import PeopleIcon from '@mui/icons-material/People';
import BarChartIcon from '@mui/icons-material/BarChart';
import SettingsIcon from '@mui/icons-material/Settings';
import { Sidebar, Navbar } from '../common';
import { ROUTES } from '../../utils/constants';

/**
 * Admin Layout with sidebar navigation
 */
function AdminLayout({ children, title }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const sidebarItems = [
    { label: 'Dashboard', path: ROUTES.ADMIN.HOME, icon: <DashboardIcon /> },
    { divider: true },
    { subheader: 'Management' },
    { label: 'Courses', path: ROUTES.ADMIN.COURSES, icon: <SchoolIcon /> },
    { label: 'Users', path: ROUTES.ADMIN.USERS, icon: <PeopleIcon /> },
    { divider: true },
    { subheader: 'Reports' },
    { label: 'Analytics', path: ROUTES.ADMIN.ANALYTICS, icon: <BarChartIcon /> },
    { divider: true },
    { label: 'Settings', path: '/admin/settings', icon: <SettingsIcon /> },
  ];

  const sidebarWidth = 280;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        items={sidebarItems}
        header="Admin Panel"
        width={sidebarWidth}
        variant={isMobile ? 'temporary' : 'permanent'}
      />

      {/* Main content area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          ml: { md: `${sidebarWidth}px` },
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Navbar />
        <Box
          sx={{
            p: 3,
            flex: 1,
          }}
          id="main-content"
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}

export default AdminLayout;
