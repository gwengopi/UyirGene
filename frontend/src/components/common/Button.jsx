import React, { forwardRef } from 'react';
import { Button as MuiButton, CircularProgress } from '@mui/material';

/**
 * Enhanced Button component with loading state and accessibility features
 */
const Button = forwardRef(function Button(
  {
    children,
    loading = false,
    disabled = false,
    startIcon,
    endIcon,
    loadingPosition = 'center',
    variant = 'contained',
    color = 'primary',
    size = 'medium',
    fullWidth = false,
    type = 'button',
    onClick,
    'aria-label': ariaLabel,
    ...props
  },
  ref
) {
  const isDisabled = disabled || loading;

  const renderLoadingIndicator = () => (
    <CircularProgress
      size={size === 'small' ? 16 : 20}
      color="inherit"
      aria-hidden="true"
    />
  );

  const getStartIcon = () => {
    if (loading && loadingPosition === 'start') {
      return renderLoadingIndicator();
    }
    return startIcon;
  };

  const getEndIcon = () => {
    if (loading && loadingPosition === 'end') {
      return renderLoadingIndicator();
    }
    return endIcon;
  };

  return (
    <MuiButton
      ref={ref}
      variant={variant}
      color={color}
      size={size}
      fullWidth={fullWidth}
      disabled={isDisabled}
      type={type}
      onClick={onClick}
      startIcon={getStartIcon()}
      endIcon={getEndIcon()}
      aria-label={ariaLabel}
      aria-busy={loading}
      aria-disabled={isDisabled}
      sx={{
        position: 'relative',
        ...props.sx,
      }}
      {...props}
    >
      {loading && loadingPosition === 'center' ? (
        <>
          <span style={{ visibility: 'hidden' }}>{children}</span>
          <CircularProgress
            size={size === 'small' ? 16 : 20}
            color="inherit"
            sx={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
            }}
            aria-hidden="true"
          />
        </>
      ) : (
        children
      )}
    </MuiButton>
  );
});

export default Button;
