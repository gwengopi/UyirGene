import React from 'react';
import { Link } from '@mui/material';

/**
 * Skip to main content link for keyboard accessibility
 */
function SkipLink({ targetId = 'main-content', children = 'Skip to main content' }) {
  return (
    <Link
      href={`#${targetId}`}
      className="skip-link"
      sx={{
        position: 'absolute',
        left: '-9999px',
        top: 'auto',
        width: '1px',
        height: '1px',
        overflow: 'hidden',
        zIndex: 9999,
        '&:focus': {
          position: 'fixed',
          top: '10px',
          left: '10px',
          width: 'auto',
          height: 'auto',
          padding: '16px 24px',
          backgroundColor: 'background.paper',
          color: 'text.primary',
          borderRadius: '4px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
          outline: '2px solid',
          outlineColor: 'focus.main',
          outlineOffset: '2px',
          textDecoration: 'none',
        },
      }}
    >
      {children}
    </Link>
  );
}

export default SkipLink;
