import React from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
  Drawer,
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';

/**
 * Sidebar navigation component for admin/dashboard pages
 */
function Sidebar({
  open,
  onClose,
  width = 280,
  items = [],
  header,
  footer,
  variant = 'temporary',
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();

  const isActive = (path) => {
    if (path === location.pathname) return true;
    // Check if current path starts with the item path (for nested routes)
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const drawerContent = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
      role="navigation"
      aria-label="Sidebar navigation"
    >
      {/* Header */}
      {header && (
        <>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: 2,
              minHeight: 64,
            }}
          >
            {typeof header === 'string' ? (
              <Typography variant="h6" fontWeight={600}>
                {header}
              </Typography>
            ) : (
              header
            )}
            {isMobile && (
              <IconButton onClick={onClose} aria-label="Close sidebar">
                <ChevronLeftIcon />
              </IconButton>
            )}
          </Box>
          <Divider />
        </>
      )}

      {/* Navigation items */}
      <Box sx={{ flex: 1, overflow: 'auto', py: 1 }}>
        <List>
          {items.map((item, index) => {
            if (item.divider) {
              return <Divider key={`divider-${index}`} sx={{ my: 1 }} />;
            }

            if (item.subheader) {
              return (
                <Typography
                  key={`subheader-${index}`}
                  variant="overline"
                  sx={{
                    px: 3,
                    py: 1,
                    display: 'block',
                    color: 'text.secondary',
                  }}
                >
                  {item.subheader}
                </Typography>
              );
            }

            const active = isActive(item.path);

            return (
              <ListItemButton
                key={item.path || item.label}
                component={item.path ? RouterLink : 'button'}
                to={item.path}
                onClick={item.onClick}
                selected={active}
                aria-current={active ? 'page' : undefined}
                sx={{
                  mx: 1,
                  borderRadius: 1,
                  '&.Mui-selected': {
                    backgroundColor: 'primary.main',
                    color: 'primary.contrastText',
                    '& .MuiListItemIcon-root': {
                      color: 'inherit',
                    },
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                  },
                }}
              >
                {item.icon && (
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {item.icon}
                  </ListItemIcon>
                )}
                <ListItemText
                  primary={item.label}
                  secondary={item.description}
                  primaryTypographyProps={{
                    variant: 'body2',
                    fontWeight: active ? 600 : 400,
                  }}
                />
                {item.badge && (
                  <Box
                    sx={{
                      backgroundColor: 'error.main',
                      color: 'error.contrastText',
                      borderRadius: '10px',
                      px: 1,
                      fontSize: '0.75rem',
                      fontWeight: 600,
                    }}
                  >
                    {item.badge}
                  </Box>
                )}
              </ListItemButton>
            );
          })}
        </List>
      </Box>

      {/* Footer */}
      {footer && (
        <>
          <Divider />
          <Box sx={{ p: 2 }}>{footer}</Box>
        </>
      )}
    </Box>
  );

  if (variant === 'permanent' && !isMobile) {
    return (
      <Drawer
        variant="permanent"
        sx={{
          width,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width,
            boxSizing: 'border-box',
          },
        }}
      >
        {drawerContent}
      </Drawer>
    );
  }

  return (
    <Drawer
      variant="temporary"
      anchor="left"
      open={open}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      sx={{
        '& .MuiDrawer-paper': {
          width,
          boxSizing: 'border-box',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
}

export default Sidebar;
