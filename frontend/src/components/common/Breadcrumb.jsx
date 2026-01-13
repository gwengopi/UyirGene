import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Breadcrumbs as MuiBreadcrumbs, Link, Typography, Box } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import HomeIcon from '@mui/icons-material/Home';

/**
 * Accessible Breadcrumb navigation component
 */
function Breadcrumb({ items = [], showHome = true }) {
  if (items.length === 0) return null;

  const allItems = showHome
    ? [{ label: 'Home', path: '/', icon: <HomeIcon sx={{ fontSize: 18, mr: 0.5 }} /> }, ...items]
    : items;

  return (
    <Box sx={{ mb: 2 }}>
      <MuiBreadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        aria-label="Breadcrumb navigation"
      >
        {allItems.map((item, index) => {
          const isLast = index === allItems.length - 1;

          if (isLast) {
            return (
              <Typography
                key={item.label}
                color="text.primary"
                aria-current="page"
                sx={{ display: 'flex', alignItems: 'center' }}
              >
                {item.icon}
                {item.label}
              </Typography>
            );
          }

          return (
            <Link
              key={item.label}
              component={RouterLink}
              to={item.path}
              color="text.secondary"
              sx={{
                display: 'flex',
                alignItems: 'center',
                '&:hover': { color: 'primary.main' },
              }}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </MuiBreadcrumbs>
    </Box>
  );
}

export default Breadcrumb;
