import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import { darkTheme, lightTheme } from './styles/theme';
import './styles/global.css';

// Store providers
import { AuthProvider, ToastProvider, UIProvider, ConfigProvider, useUI } from './store';

// Common components
import {
  Navbar,
  Footer,
  SkipLink,
  ErrorBoundary,
  LoadingSpinner,
} from './components/common';

// Route protection
import { ProtectedRoute, PublicRoute, RoleRoute } from './routes';
import { ROUTES, ROLES } from './utils/constants';

// Lazy load pages for code splitting
const Home = lazy(() => import('./pages/Home'));
const Courses = lazy(() => import('./pages/Courses'));
const CourseDetail = lazy(() => import('./pages/CourseDetail'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const CertificateVerify = lazy(() => import('./pages/CertificateVerify'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const MyCourses = lazy(() => import('./pages/MyCourses'));
const Payment = lazy(() => import('./pages/Payment'));
const Profile = lazy(() => import('./pages/Profile'));
const AdminDashboard = lazy(() => import('./pages/Admin/index'));
const AdminCourses = lazy(() => import('./pages/Admin/Courses'));
const AdminUsers = lazy(() => import('./pages/Admin/Users'));
const AdminAnalytics = lazy(() => import('./pages/Admin/Analytics'));
const AdminSettings = lazy(() => import('./pages/Admin/Settings'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Unauthorized = lazy(() => import('./pages/Unauthorized'));

// Static pages
const About = lazy(() => import('./pages/About'));
const Blog = lazy(() => import('./pages/Blog'));
const Contact = lazy(() => import('./pages/Contact'));
const Careers = lazy(() => import('./pages/Careers'));
const Help = lazy(() => import('./pages/Help'));
const FAQ = lazy(() => import('./pages/FAQ'));
const Community = lazy(() => import('./pages/Community'));
const Terms = lazy(() => import('./pages/Terms'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Cookies = lazy(() => import('./pages/Cookies'));
const Accessibility = lazy(() => import('./pages/Accessibility'));
const Refund = lazy(() => import('./pages/Refund'));

// Loading fallback component
function PageLoader() {
  return <LoadingSpinner fullScreen text="Loading..." />;
}

// Theme wrapper that uses UI context for theme mode
function ThemedApp({ children }) {
  const { isDarkMode } = useUI();
  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}

export default function App() {
  return (
    <UIProvider>
      <ThemedApp>
        <ErrorBoundary>
          <AuthProvider>
            <ToastProvider>
              <ConfigProvider>
                <SkipLink />
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: '100vh',
                }}
              >
                <Navbar />
                <Box
                  component="main"
                  id="main-content"
                  sx={{ flex: 1 }}
                  role="main"
                >
                  <Suspense fallback={<PageLoader />}>
                    <Routes>
                      {/* Public routes */}
                      <Route path={ROUTES.HOME} element={<Home />} />
                      <Route path={ROUTES.COURSES} element={<Courses />} />
                      <Route path="/courses/:id" element={<CourseDetail />} />
                      <Route path="/certificate/:id" element={<CertificateVerify />} />

                      {/* Auth routes - redirect if logged in */}
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

                      {/* Protected routes - requires authentication */}
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

                      {/* Payment page for paid enrollments */}
                      <Route
                        path={ROUTES.PAYMENT}
                        element={
                          <ProtectedRoute>
                            <Payment />
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

                      {/* Admin routes - requires ADMIN or INSTRUCTOR role */}
                      <Route
                        path={ROUTES.ADMIN.HOME}
                        element={
                          <RoleRoute allowedRoles={[ROLES.ADMIN, ROLES.INSTRUCTOR]}>
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
                          <RoleRoute allowedRoles={[ROLES.ADMIN, ROLES.INSTRUCTOR]}>
                            <AdminUsers />
                          </RoleRoute>
                        }
                      />
                      <Route
                        path={ROUTES.ADMIN.ANALYTICS}
                        element={
                          <RoleRoute allowedRoles={[ROLES.ADMIN, ROLES.INSTRUCTOR]}>
                            <AdminAnalytics />
                          </RoleRoute>
                        }
                      />
                      <Route
                        path={ROUTES.ADMIN.SETTINGS}
                        element={
                          <RoleRoute allowedRoles={[ROLES.ADMIN]}>
                            <AdminSettings />
                          </RoleRoute>
                        }
                      />

                      {/* Static pages */}
                      <Route path="/about" element={<About />} />
                      <Route path="/blog" element={<Blog />} />
                      <Route path="/contact" element={<Contact />} />
                      <Route path="/careers" element={<Careers />} />
                      <Route path="/help" element={<Help />} />
                      <Route path="/faq" element={<FAQ />} />
                      <Route path="/community" element={<Community />} />
                      <Route path="/terms" element={<Terms />} />
                      <Route path="/privacy" element={<Privacy />} />
                      <Route path="/cookies" element={<Cookies />} />
                      <Route path="/accessibility" element={<Accessibility />} />
                      <Route path="/refund" element={<Refund />} />

                      {/* Error pages */}
                      <Route path={ROUTES.UNAUTHORIZED} element={<Unauthorized />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                </Box>
                <Footer />
              </Box>
              </ConfigProvider>
            </ToastProvider>
          </AuthProvider>
        </ErrorBoundary>
      </ThemedApp>
    </UIProvider>
  );
}
