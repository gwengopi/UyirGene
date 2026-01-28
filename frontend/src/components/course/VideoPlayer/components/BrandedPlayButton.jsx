import React from 'react';
import { Box, IconButton } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

// Logo URL - inline to avoid circular dependency
const LOGO_SMALL = 'https://img1.wsimg.com/isteam/ip/1026513f-a4fe-4205-ac72-b744196cbd6f/UI_color-removebg-preview%202.png/:/rs=h:40,cg:true,m/qt=q:100/ll';

/**
 * Branded center play button with logo
 */
function BrandedPlayButton({ onClick }) {
  return (
    <Box
      sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        cursor: 'pointer',
      }}
      onClick={onClick}
    >
      {/* Logo */}
      <Box
        component="img"
        src={LOGO_SMALL}
        alt="Uyirgene"
        sx={{
          height: 32,
          opacity: 0.9,
          filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5))',
        }}
        onError={(e) => {
          e.target.style.display = 'none';
        }}
      />

      {/* Play button */}
      <IconButton
        aria-label="Play video"
        sx={{
          backgroundColor: 'rgba(79, 102, 114, 0.9)',
          color: 'white',
          width: 80,
          height: 80,
          transition: 'transform 0.2s, background-color 0.2s',
          '&:hover': {
            backgroundColor: 'rgba(79, 102, 114, 1)',
            transform: 'scale(1.1)',
          },
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
        }}
      >
        <PlayArrowIcon sx={{ fontSize: 48 }} />
      </IconButton>
    </Box>
  );
}

export default BrandedPlayButton;
