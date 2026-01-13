import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../store';
import { LoadingSpinner } from '../components/common';
import { ROUTES } from '../utils/constants';

/**
 * Protected Route component - requires authentication
 */
function ProtectedRoute({ children, redirectTo = ROUTES.LOGIN }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Show loading while checking auth state
  if (loading) {
    return <LoadingSpinner fullScreen text="Loading..." />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated()) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  return children;
}

export default ProtectedRoute;
