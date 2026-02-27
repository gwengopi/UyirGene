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
  Collapse,
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
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import MiscellaneousServicesIcon from '@mui/icons-material/MiscellaneousServices';
import BiotechIcon from '@mui/icons-material/Biotech';
import VerifiedIcon from '@mui/icons-material/Verified';
import ScienceIcon from '@mui/icons-material/Science';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import MenuBookIcon from '@mui/icons-material/MenuBook';

import { useAuth, useUI } from '../../../store';
import { ROUTES, ROLES, IMAGES } from '../../../utils/constants';

// Services sub-menu items
const servicesSubItems = [
  { label: 'All Services', path: ROUTES.SERVICES, icon: <MiscellaneousServicesIcon fontSize="small" /> },
  { label: 'Training', path: ROUTES.SERVICES_LEARNING, icon: <MenuBookIcon fontSize="small" /> },
  { label: 'Microbiology Research', path: ROUTES.SERVICES_MICROBIOLOGY, icon: <BiotechIcon fontSize="small" /> },
  { label: 'Auditing and Certifications', path: ROUTES.SERVICES_CERTIFICATION, icon: <VerifiedIcon fontSize="small" /> },
  { label: 'Testing', path: ROUTES.SERVICES_TESTING, icon: <ScienceIcon fontSize="small" /> },
  { label: 'Clinical Research', path: ROUTES.SERVICES_CLINICAL_RESEARCH, icon: <LocalHospitalIcon fontSize="small" /> },
];

function Navbar() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const { auth, user, logout, isAuthenticated, isAdmin, isInstructor } = useAuth();
  const { isDarkMode, toggleTheme } = useUI();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [servicesAnchorEl, setServicesAnchorEl] = useState(null);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleServicesMenuOpen = (event) => {
    setServicesAnchorEl(event.currentTarget);
  };

  const handleServicesMenuClose = () => {
    setServicesAnchorEl(null);
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
    handleServicesMenuClose();
  };

  const isActive = (path) => location.pathname === path;
  const isServicesActive = location.pathname.startsWith('/services');

  // Navigation items for public users (excluding Services which is handled separately)
  const publicNavItems = [
    { label: 'Home', path: ROUTES.HOME, icon: <HomeIcon /> },
    { label: 'Courses', path: ROUTES.COURSES, icon: <SchoolIcon /> },
    { label: 'Standards', path: ROUTES.STANDARDS, icon: <MenuBookIcon /> },
    { label: 'Verify Certificate', path: ROUTES.VERIFY_CERTIFICATE, icon: <VerifiedUserIcon /> },
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
      if (isAdmin() || isInstructor()) {
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
        {/* Home */}
        <ListItemButton
          onClick={() => handleNavigation(ROUTES.HOME)}
          selected={isActive(ROUTES.HOME)}
          aria-current={isActive(ROUTES.HOME) ? 'page' : undefined}
        >
          <ListItemIcon><HomeIcon /></ListItemIcon>
          <ListItemText primary="Home" />
        </ListItemButton>

        {/* Services with expandable sub-menu */}
        <ListItemButton
          onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
          selected={isServicesActive}
        >
          <ListItemIcon><MiscellaneousServicesIcon /></ListItemIcon>
          <ListItemText primary="Services" />
          {mobileServicesOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </ListItemButton>
        <Collapse in={mobileServicesOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {servicesSubItems.map((item) => (
              <ListItemButton
                key={item.path}
                sx={{ pl: 4 }}
                onClick={() => handleNavigation(item.path)}
                selected={isActive(item.path)}
                aria-current={isActive(item.path) ? 'page' : undefined}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} primaryTypographyProps={{ variant: 'body2' }} />
              </ListItemButton>
            ))}
          </List>
        </Collapse>

        {/* Remaining nav items (Courses, My Courses, Dashboard, Admin) */}
        {navItems.filter((item) => item.path !== ROUTES.HOME).map((item) => (
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
        {/* Theme toggle in mobile */}
        <ListItemButton onClick={toggleTheme}>
          <ListItemIcon>
            {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </ListItemIcon>
          <ListItemText primary={isDarkMode ? 'Light Mode' : 'Dark Mode'} />
        </ListItemButton>
        <Divider />
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
      <AppBar position="fixed" component="nav">
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

          <Box
            component={RouterLink}
            to={ROUTES.HOME}
            sx={{
              display: 'flex',
              alignItems: 'center',
              flexGrow: { xs: 1, md: 0 },
              mr: { md: 4 },
              textDecoration: 'none',
            }}
          >
            <Box
              component="img"
              src={IMAGES.LOGO_SMALL}
              alt="Uyirgene International"
              sx={{
                height: { xs: 32, md: 40 },
                filter: 'brightness(1.2)',
              }}
            />
          </Box>

          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 1, flexGrow: 1 }} role="navigation" aria-label="Main navigation">
              {/* Home link */}
              <Button
                component={RouterLink}
                to={ROUTES.HOME}
                color="inherit"
                startIcon={<HomeIcon />}
                aria-current={isActive(ROUTES.HOME) ? 'page' : undefined}
                sx={{
                  backgroundColor: isActive(ROUTES.HOME) ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                }}
              >
                Home
              </Button>

              {/* Services dropdown button */}
              <Button
                color="inherit"
                startIcon={<MiscellaneousServicesIcon />}
                endIcon={<ArrowDropDownIcon />}
                onClick={handleServicesMenuOpen}
                aria-haspopup="true"
                aria-expanded={Boolean(servicesAnchorEl)}
                sx={{
                  backgroundColor: isServicesActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                }}
              >
                Services
              </Button>
              <Menu
                anchorEl={servicesAnchorEl}
                open={Boolean(servicesAnchorEl)}
                onClose={handleServicesMenuClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                MenuListProps={{ sx: { minWidth: 220 } }}
              >
                {servicesSubItems.map((item) => (
                  <MenuItem
                    key={item.path}
                    onClick={() => handleNavigation(item.path)}
                    selected={isActive(item.path)}
                  >
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.label} />
                  </MenuItem>
                ))}
              </Menu>

              {/* Remaining nav items (Courses, My Courses, Dashboard, Admin) */}
              {navItems.filter((item) => item.path !== ROUTES.HOME).map((item) => (
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
              {/* Theme toggle button */}
              <IconButton
                onClick={toggleTheme}
                color="inherit"
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                sx={{ mr: 1 }}
              >
                {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>

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
                    <MenuItem disabled sx={{ '&.Mui-disabled': { opacity: 1 } }}>
                      <Typography variant="body2" color="text.primary">
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
                    sx={{
                      color: '#fff',
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                      '&:hover': {
                        borderColor: 'rgba(255, 255, 255, 0.6)',
                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      },
                    }}
                  >
                    Login
                  </Button>
                  <Button
                    component={RouterLink}
                    to={ROUTES.REGISTER}
                    color="inherit"
                    variant="contained"
                    sx={{
                      color: '#fff',
                      bgcolor: 'primary.dark',
                      '&:hover': {
                        bgcolor: 'primary.main',
                      },
                    }}
                  >
                    Register
                  </Button>
                </>
              )}
            </Box>
          )}
        </Toolbar>
      </AppBar>
      <Toolbar />

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
