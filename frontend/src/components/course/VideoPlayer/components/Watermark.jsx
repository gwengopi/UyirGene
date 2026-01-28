import React from 'react';
import { Box, Typography } from '@mui/material';

// Logo URL - inline to avoid circular dependency
const LOGO_SMALL = 'https://img1.wsimg.com/isteam/ip/1026513f-a4fe-4205-ac72-b744196cbd6f/UI_color-removebg-preview%202.png/:/rs=h:40,cg:true,m/qt=q:100/ll';

/**
 * Anti-piracy watermark overlay
 * Displays user email, timestamp, and logo
 */
function Watermark({ userEmail }) {
  const watermarkText = userEmail || 'Uyirgene Learning';
  const timestamp = new Date().toISOString().slice(0, 10);

  return (
    <Box
      sx={{
        position: 'absolute',
        bottom: 70,
        right: 20,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        opacity: 0.25,
        pointerEvents: 'none',
        userSelect: 'none',
        transform: 'rotate(-15deg)',
        zIndex: 5,
      }}
    >
      {/* Logo */}
      <Box
        component="img"
        src={LOGO_SMALL}
        alt=""
        aria-hidden="true"
        sx={{
          height: 24,
          mb: 0.5,
          opacity: 0.7,
          filter: 'brightness(0) invert(1)',
        }}
        onError={(e) => {
          e.target.style.display = 'none';
        }}
      />

      {/* User email */}
      <Typography
        variant="caption"
        sx={{
          color: 'white',
          textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)',
          fontSize: '0.7rem',
          fontWeight: 500,
          letterSpacing: '0.5px',
        }}
      >
        {watermarkText}
      </Typography>

      {/* Timestamp */}
      <Typography
        variant="caption"
        sx={{
          color: 'white',
          textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)',
          fontSize: '0.6rem',
          opacity: 0.8,
        }}
      >
        {timestamp}
      </Typography>
    </Box>
  );
}

export default Watermark;
