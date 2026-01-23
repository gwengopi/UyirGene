import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../../store';
import { clearAuthHeader } from '../../api';

/**
 * Admin page header with navigation and logout
 */
function AdminHeader() {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    clearAuthHeader();
    navigate('/login');
  };

  const handleHome = () => {
    navigate('/');
  };

  return (
    <AppBar position="static" sx={{ mb: 0 }}>
      <Toolbar>
        {/* Branding - left side */}
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              display: { xs: 'none', sm: 'block' },
            }}
          >
            Admin Panel
          </Typography>
        </Box>

        {/* User Info, Home and Logout - right side */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography
            variant="body2"
            sx={{
              display: { xs: 'none', sm: 'block' },
              maxWidth: '200px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {auth?.user?.email}
          </Typography>
          <Button
            onClick={handleHome}
            color="inherit"
            startIcon={<HomeIcon />}
            size="small"
            sx={{
              textTransform: 'none',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.2)',
              },
            }}
          >
            <span style={{ display: { xs: 'none', sm: 'inline' } }}>Home</span>
          </Button>
          <Button
            color="inherit"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            size="small"
            sx={{
              textTransform: 'none',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.1)',
              },
            }}
          >
            <span style={{ display: { xs: 'none', sm: 'inline' } }}>Logout</span>
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default AdminHeader;
