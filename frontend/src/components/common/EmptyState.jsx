import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import InboxIcon from '@mui/icons-material/Inbox';

/**
 * Empty state component for when there's no data to display
 */
function EmptyState({
  icon,
  title = 'No data found',
  description,
  action,
  actionLabel,
  onAction,
  sx = {},
}) {
  const IconComponent = icon || InboxIcon;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        py: 8,
        px: 3,
        ...sx,
      }}
    >
      <IconComponent
        sx={{
          fontSize: 80,
          color: 'text.disabled',
          mb: 2,
        }}
        aria-hidden="true"
      />
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      {description && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ maxWidth: 400, mb: action || actionLabel ? 3 : 0 }}
        >
          {description}
        </Typography>
      )}
      {(action || actionLabel) && (
        <Button variant="contained" onClick={onAction}>
          {actionLabel || action}
        </Button>
      )}
    </Box>
  );
}

export default EmptyState;
