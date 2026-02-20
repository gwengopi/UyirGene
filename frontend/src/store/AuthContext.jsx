import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services';
import { isAuthenticated as checkAuth, clearAuthHeader, setAuthHeader } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => ({
    token: localStorage.getItem('uyir_auth'),
    user: null,
    loading: true,
  }));

  // Load user data on mount
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('uyir_auth');
      if (!token) {
        setAuth({ token: null, user: null, loading: false });
        return;
      }

      try {
        const user = await authService.getCurrentUser();
        setAuth({ token, user, loading: false });
      } catch (error) {
        console.error('Failed to load user:', error);
        clearAuthHeader();
        setAuth({ token: null, user: null, loading: false });
      }
    };

    loadUser();
  }, []);

  // Login function
  const login = useCallback(async (email, password) => {
    const result = await authService.login(email, password);
    setAuth({ token: result.token, user: result.user, loading: false });
    return result;
  }, []);

  // Login with token (for when token is already set)
  const loginWithToken = useCallback((token, user) => {
    setAuthHeader(token);
    setAuth({ token, user, loading: false });
  }, []);

  // Logout function - clear all user-related cached data
  const logout = useCallback(() => {
    authService.logout();
    // Clear any cached user data from localStorage
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('uyir_') && key !== 'uyir_auth') {
        localStorage.removeItem(key);
      }
    });
    setAuth({ token: null, user: null, loading: false });
  }, []);

  // Refresh user data from server
  const refreshUser = useCallback(async () => {
    try {
      const user = await authService.getCurrentUser();
      setAuth((prev) => ({ ...prev, user }));
      return user;
    } catch (error) {
      console.error('Failed to refresh user:', error);
      return null;
    }
  }, []);

  // Check if user is authenticated
  const isAuthenticated = useCallback(() => {
    return !!auth.token && !!auth.user;
  }, [auth.token, auth.user]);

  // Check if user has specific role
  const hasRole = useCallback(
    (roles) => {
      if (!auth.user) return false;
      const roleArray = Array.isArray(roles) ? roles : [roles];
      return roleArray.includes(auth.user.role);
    },
    [auth.user]
  );

  // Check if user is admin
  const isAdmin = useCallback(() => hasRole('ADMIN'), [hasRole]);

  // Check if user is instructor
  const isInstructor = useCallback(() => hasRole(['ADMIN', 'INSTRUCTOR']), [hasRole]);

  const value = {
    auth,
    user: auth.user,
    token: auth.token,
    loading: auth.loading,
    login,
    loginWithToken,
    logout,
    refreshUser,
    isAuthenticated,
    hasRole,
    isAdmin,
    isInstructor,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
