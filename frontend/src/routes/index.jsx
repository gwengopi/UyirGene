import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LoadingSpinner } from '../components/common';
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';
import RoleRoute from './RoleRoute';
import { ROUTES, ROLES } from '../utils/constants';

// Lazy load pages for code splitting
const Home = lazy(() => import('../pages/Home'));
const Courses = lazy(() => import('../pages/Courses'));
const CourseDetail = lazy(() => import('../pages/CourseDetail'));
const Login = lazy(() => import('../pages/Login'));
const Register = lazy(() => import('../pages/Register'));
const Dashboard = lazy(() => import('../pages/Dashboard'));
const MyCourses = lazy(() => import('../pages/MyCourses'));
const Profile = lazy(() => import('../pages/Profile'));
const CertificateVerify = lazy(() => import('../pages/CertificateVerify'));

// Admin pages
const AdminDashboard = lazy(() => import('../pages/Admin'));
const AdminCourses = lazy(() => import('../pages/Admin/Courses'));
const AdminUsers = lazy(() => import('../pages/Admin/Users'));
const AdminAnalytics = lazy(() => import('../pages/Admin/Analytics'));

// Error pages
const NotFound = lazy(() => import('../pages/NotFound'));
const Unauthorized = lazy(() => import('../pages/Unauthorized'));

/**
 * Application Routes Configuration
 */
function AppRoutes() {
  return (
    <Suspense fallback={<LoadingSpinner fullScreen text="Loading page..." />}>
      <Routes>
        {/* Public routes */}
        <Route path={ROUTES.HOME} element={<Home />} />
        <Route path={ROUTES.COURSES} element={<Courses />} />
        <Route path="/courses/:id" element={<CourseDetail />} />
        <Route path="/certificate/:id" element={<CertificateVerify />} />

        {/* Auth routes - redirect if already logged in */}
        <Route
          path={ROUTES.LOGIN}
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path={ROUTES.REGISTER}
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        {/* Protected routes - require authentication */}
        <Route
          path={ROUTES.DASHBOARD}
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.MY_COURSES}
          element={
            <ProtectedRoute>
              <MyCourses />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.PROFILE}
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Admin routes - require ADMIN role */}
        <Route
          path={ROUTES.ADMIN.HOME}
          element={
            <RoleRoute allowedRoles={[ROLES.ADMIN]}>
              <AdminDashboard />
            </RoleRoute>
          }
        />
        <Route
          path={ROUTES.ADMIN.COURSES}
          element={
            <RoleRoute allowedRoles={[ROLES.ADMIN, ROLES.INSTRUCTOR]}>
              <AdminCourses />
            </RoleRoute>
          }
        />
        <Route
          path={ROUTES.ADMIN.USERS}
          element={
            <RoleRoute allowedRoles={[ROLES.ADMIN]}>
              <AdminUsers />
            </RoleRoute>
          }
        />
        <Route
          path={ROUTES.ADMIN.ANALYTICS}
          element={
            <RoleRoute allowedRoles={[ROLES.ADMIN]}>
              <AdminAnalytics />
            </RoleRoute>
          }
        />

        {/* Error pages */}
        <Route path={ROUTES.UNAUTHORIZED} element={<Unauthorized />} />
        <Route path={ROUTES.NOT_FOUND} element={<NotFound />} />

        {/* Catch all - redirect to 404 */}
        <Route path="*" element={<Navigate to={ROUTES.NOT_FOUND} replace />} />
      </Routes>
    </Suspense>
  );
}

export { ProtectedRoute, PublicRoute, RoleRoute };
export default AppRoutes;
