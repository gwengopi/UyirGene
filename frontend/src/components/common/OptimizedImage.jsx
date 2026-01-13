import React, { useState, useRef, useEffect } from 'react';
import { Box, Skeleton } from '@mui/material';

/**
 * Optimized Image component with lazy loading and placeholder
 */
function OptimizedImage({
  src,
  alt,
  width,
  height,
  aspectRatio,
  objectFit = 'cover',
  placeholder,
  fallback,
  loading = 'lazy',
  onLoad,
  onError,
  sx = {},
  ...props
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(loading !== 'lazy');
  const imgRef = useRef(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (loading !== 'lazy' || isInView) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '100px',
        threshold: 0.1,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [loading, isInView]);

  const handleLoad = (e) => {
    setIsLoaded(true);
    onLoad?.(e);
  };

  const handleError = (e) => {
    setHasError(true);
    onError?.(e);
  };

  const containerStyles = {
    position: 'relative',
    overflow: 'hidden',
    width: width || '100%',
    height: height || (aspectRatio ? 'auto' : '100%'),
    aspectRatio: aspectRatio,
    ...sx,
  };

  // Show fallback on error
  if (hasError) {
    if (fallback) {
      return (
        <Box ref={imgRef} sx={containerStyles} {...props}>
          {typeof fallback === 'string' ? (
            <img
              src={fallback}
              alt={alt}
              style={{
                width: '100%',
                height: '100%',
                objectFit,
              }}
            />
          ) : (
            fallback
          )}
        </Box>
      );
    }

    return (
      <Box
        ref={imgRef}
        sx={{
          ...containerStyles,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.1)',
          color: 'text.secondary',
        }}
        {...props}
      >
        <span>Image not available</span>
      </Box>
    );
  }

  return (
    <Box ref={imgRef} sx={containerStyles} {...props}>
      {/* Loading placeholder */}
      {!isLoaded && (
        <Skeleton
          variant="rectangular"
          animation="wave"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
          }}
        />
      )}

      {/* Actual image */}
      {isInView && (
        <img
          src={src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          style={{
            width: '100%',
            height: '100%',
            objectFit,
            opacity: isLoaded ? 1 : 0,
            transition: 'opacity 0.3s ease-in-out',
          }}
        />
      )}
    </Box>
  );
}

export default OptimizedImage;
