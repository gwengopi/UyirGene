import React, { useState } from 'react';
import { Box, useMediaQuery, useTheme, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SchoolIcon from '@mui/icons-material/School';
import ArticleIcon from '@mui/icons-material/Article';
import PeopleIcon from '@mui/icons-material/People';
import BarChartIcon from '@mui/icons-material/BarChart';
import SettingsIcon from '@mui/icons-material/Settings';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import EmailIcon from '@mui/icons-material/Email';
import StarIcon from '@mui/icons-material/Star';
import CampaignIcon from '@mui/icons-material/Campaign';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { Sidebar } from '../common';
import AdminHeader from './AdminHeader';
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
    { label: 'Flagship Programs', path: ROUTES.ADMIN.FLAGSHIP_PROGRAMS, icon: <StarIcon /> },
    { label: 'Bundles', path: ROUTES.ADMIN.BUNDLES, icon: <LocalOfferIcon /> },
    { label: 'Blogs', path: ROUTES.ADMIN.BLOGS, icon: <ArticleIcon /> },
    { label: 'Users', path: ROUTES.ADMIN.USERS, icon: <PeopleIcon /> },
    { label: 'Certificate Templates', path: ROUTES.ADMIN.CERTIFICATE_TEMPLATES, icon: <CardMembershipIcon /> },
    { label: 'Mail Templates', path: ROUTES.ADMIN.MAIL_TEMPLATES, icon: <EmailIcon /> },
    { label: 'Marketing Campaigns', path: ROUTES.ADMIN.MARKETING_CAMPAIGNS, icon: <CampaignIcon /> },
    { label: 'Standards', path: ROUTES.ADMIN.STANDARDS, icon: <MenuBookIcon /> },
    { divider: true },
    { subheader: 'Reports' },
    { label: 'Analytics', path: ROUTES.ADMIN.ANALYTICS, icon: <BarChartIcon /> },
    { divider: true },
    { label: 'Settings', path: ROUTES.ADMIN.SETTINGS, icon: <SettingsIcon /> },
  ];

  const sidebarWidth = 280;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Admin Header */}
      <AdminHeader />

      {/* Content area with sidebar */}
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar */}
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          items={sidebarItems}
          header="Navigation"
          width={sidebarWidth}
          variant={isMobile ? 'temporary' : 'permanent'}
        />

        {/* Main content area */}
        <Box
          component="main"
          role="main"
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'auto',
            backgroundColor: 'background.default',
          }}
        >
          {/* Mobile menu button */}
          {isMobile && (
            <Box sx={{ p: 2 }}>
              <IconButton
                onClick={() => setSidebarOpen(true)}
                aria-label="Open menu"
                size="large"
              >
                <MenuIcon />
              </IconButton>
            </Box>
          )}

          {/* Page content with proper padding and styling */}
          <Box
            sx={{
              flex: 1,
              p: { xs: 2, sm: 3 },
              maxWidth: '100%',
              width: '100%',
              boxSizing: 'border-box',
            }}
          >
            {children}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default AdminLayout;
