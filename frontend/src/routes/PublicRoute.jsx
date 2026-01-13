import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../store';
import { LoadingSpinner } from '../components/common';
import { ROUTES } from '../utils/constants';

/**
 * Public Route component - redirects authenticated users away
 * Useful for login/register pages
 */
function PublicRoute({ children, redirectTo = ROUTES.DASHBOARD }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Show loading while checking auth state
  if (loading) {
    return <LoadingSpinner fullScreen text="Loading..." />;
  }

  // Redirect authenticated users to dashboard or previous location
  if (isAuthenticated()) {
    const from = location.state?.from?.pathname || redirectTo;
    return <Navigate to={from} replace />;
  }

  return children;
}

export default PublicRoute;
