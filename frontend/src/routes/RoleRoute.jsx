import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../store';
import { LoadingSpinner } from '../components/common';
import { ROUTES } from '../utils/constants';

/**
 * Role-based Route component - requires specific role(s)
 */
function RoleRoute({
  children,
  allowedRoles = [],
  redirectTo = ROUTES.UNAUTHORIZED,
  loginRedirect = ROUTES.LOGIN,
}) {
  const { isAuthenticated, hasRole, loading } = useAuth();

  // Show loading while checking auth state
  if (loading) {
    return <LoadingSpinner fullScreen text="Loading..." />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated()) {
    return <Navigate to={loginRedirect} replace />;
  }

  // Check if user has required role
  if (allowedRoles.length > 0 && !hasRole(allowedRoles)) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}

export default RoleRoute;
