import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material';
import { theme } from '../styles/theme';
import { AuthProvider, ToastProvider, UIProvider } from '../store';

/**
 * Custom render function that includes all providers
 */
export function renderWithProviders(ui, options = {}) {
  const {
    route = '/',
    ...renderOptions
  } = options;

  // Set the initial route
  window.history.pushState({}, 'Test page', route);

  function AllProviders({ children }) {
    return (
      <ThemeProvider theme={theme}>
        <BrowserRouter>
          <AuthProvider>
            <ToastProvider>
              <UIProvider>
                {children}
              </UIProvider>
            </ToastProvider>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    );
  }

  return {
    ...render(ui, { wrapper: AllProviders, ...renderOptions }),
  };
}

/**
 * Render with only Router provider
 */
export function renderWithRouter(ui, { route = '/' } = {}) {
  window.history.pushState({}, 'Test page', route);

  return {
    ...render(ui, { wrapper: BrowserRouter }),
  };
}

/**
 * Mock user for auth tests
 */
export const mockUser = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  role: 'USER',
};

export const mockAdminUser = {
  id: 2,
  name: 'Admin User',
  email: 'admin@example.com',
  role: 'ADMIN',
};

/**
 * Mock course data
 */
export const mockCourse = {
  id: 1,
  title: 'Test Course',
  description: 'This is a test course description',
  instructor: 'Test Instructor',
  price: 999,
  category: 'Programming',
  duration: '10 hours',
  imageUrl: '/test-image.jpg',
  videoCount: 10,
};

export const mockCourses = [
  mockCourse,
  {
    id: 2,
    title: 'Another Course',
    description: 'Another course description',
    instructor: 'Another Instructor',
    price: 0,
    category: 'Design',
    duration: '5 hours',
    imageUrl: '/test-image-2.jpg',
    videoCount: 5,
  },
];

/**
 * Mock video data
 */
export const mockVideo = {
  id: 1,
  title: 'Introduction',
  description: 'Introduction to the course',
  url: 'https://example.com/video.mp4',
  duration: 600,
  order: 1,
};

/**
 * Wait for async operations
 */
export const waitForAsync = () => new Promise((resolve) => setTimeout(resolve, 0));

// Re-export everything from testing-library
export * from '@testing-library/react';
