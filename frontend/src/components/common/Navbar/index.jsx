import React, { useState } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Divider,
  useMediaQuery,
  useTheme,
  Avatar,
  Menu,
  MenuItem,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import HomeIcon from '@mui/icons-material/Home';
import SchoolIcon from '@mui/icons-material/School';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { useAuth } from '../../../store';
import { ROUTES, ROLES } from '../../../utils/constants';

function Navbar() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const { auth, user, logout, isAuthenticated, isAdmin, isInstructor } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate(ROUTES.LOGIN);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setMobileOpen(false);
    handleMenuClose();
  };

  const isActive = (path) => location.pathname === path;

  // Navigation items for public users
  const publicNavItems = [
    { label: 'Home', path: ROUTES.HOME, icon: <HomeIcon /> },
    { label: 'Courses', path: ROUTES.COURSES, icon: <SchoolIcon /> },
  ];

  // Navigation items for authenticated users
  const authNavItems = [
    { label: 'My Courses', path: ROUTES.MY_COURSES, icon: <LibraryBooksIcon /> },
    { label: 'Dashboard', path: ROUTES.DASHBOARD, icon: <DashboardIcon /> },
  ];

  // Admin navigation items
  const adminNavItems = [
    { label: 'Admin', path: ROUTES.ADMIN.HOME, icon: <AdminPanelSettingsIcon /> },
  ];

  const getNavItems = () => {
    let items = [...publicNavItems];
    if (isAuthenticated()) {
      items = [...items, ...authNavItems];
      if (isAdmin()) {
        items = [...items, ...adminNavItems];
      }
    }
    return items;
  };

  const navItems = getNavItems();

  // Mobile drawer content
  const drawer = (
    <Box sx={{ width: 280 }} role="navigation" aria-label="Main navigation">
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
        }}
      >
        <Typography variant="h6" component="span">
          Menu
        </Typography>
        <IconButton onClick={handleDrawerToggle} aria-label="Close menu">
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItemButton
            key={item.path}
            onClick={() => handleNavigation(item.path)}
            selected={isActive(item.path)}
            aria-current={isActive(item.path) ? 'page' : undefined}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
      <Divider />
      <List>
        {isAuthenticated() ? (
          <>
            <ListItemButton onClick={() => handleNavigation(ROUTES.PROFILE)}>
              <ListItemIcon>
                <PersonIcon />
              </ListItemIcon>
              <ListItemText primary="Profile" />
            </ListItemButton>
            <ListItemButton onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItemButton>
          </>
        ) : (
          <>
            <ListItemButton onClick={() => handleNavigation(ROUTES.LOGIN)}>
              <ListItemIcon>
                <LoginIcon />
              </ListItemIcon>
              <ListItemText primary="Login" />
            </ListItemButton>
            <ListItemButton onClick={() => handleNavigation(ROUTES.REGISTER)}>
              <ListItemIcon>
                <PersonIcon />
              </ListItemIcon>
              <ListItemText primary="Register" />
            </ListItemButton>
          </>
        )}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="sticky" component="nav">
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="Open navigation menu"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Typography
            variant="h6"
            component={RouterLink}
            to={ROUTES.HOME}
            sx={{
              flexGrow: { xs: 1, md: 0 },
              mr: { md: 4 },
              color: 'inherit',
              textDecoration: 'none',
              fontWeight: 700,
            }}
          >
            Uyirgene
          </Typography>

          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 1, flexGrow: 1 }} role="navigation" aria-label="Main navigation">
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  component={RouterLink}
                  to={item.path}
                  color="inherit"
                  startIcon={item.icon}
                  aria-current={isActive(item.path) ? 'page' : undefined}
                  sx={{
                    backgroundColor: isActive(item.path) ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
          )}

          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {isAuthenticated() ? (
                <>
                  <IconButton
                    onClick={handleMenuOpen}
                    color="inherit"
                    aria-label="User menu"
                    aria-haspopup="true"
                    aria-expanded={Boolean(anchorEl)}
                  >
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.dark' }}>
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </Avatar>
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                  >
                    <MenuItem disabled>
                      <Typography variant="body2" color="text.secondary">
                        {user?.email}
                      </Typography>
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={() => handleNavigation(ROUTES.PROFILE)}>
                      <ListItemIcon>
                        <PersonIcon fontSize="small" />
                      </ListItemIcon>
                      Profile
                    </MenuItem>
                    <MenuItem onClick={handleLogout}>
                      <ListItemIcon>
                        <LogoutIcon fontSize="small" />
                      </ListItemIcon>
                      Logout
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <>
                  <Button
                    component={RouterLink}
                    to={ROUTES.LOGIN}
                    color="inherit"
                    variant="outlined"
                    sx={{ borderColor: 'rgba(255, 255, 255, 0.3)' }}
                  >
                    Login
                  </Button>
                  <Button
                    component={RouterLink}
                    to={ROUTES.REGISTER}
                    color="inherit"
                    variant="contained"
                    sx={{ bgcolor: 'primary.dark' }}
                  >
                    Register
                  </Button>
                </>
              )}
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Drawer
        variant="temporary"
        anchor="left"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 280 },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
}

export default Navbar;
