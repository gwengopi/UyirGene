// User roles
export const ROLES = {
  ADMIN: 'ADMIN',
  INSTRUCTOR: 'INSTRUCTOR',
  STUDENT: 'STUDENT',
};

// Enrollment statuses
export const ENROLLMENT_STATUS = {
  PENDING: 'PENDING',
  ENROLLED: 'ENROLLED',
  COMPLETED: 'COMPLETED',
};

// Responsive breakpoints (in pixels)
export const BREAKPOINTS = {
  xs: 320,
  sm: 768,
  md: 1024,
  lg: 1440,
};

// Media queries for responsive design
export const MEDIA_QUERIES = {
  xs: `@media (max-width: ${BREAKPOINTS.sm - 1}px)`,
  sm: `@media (min-width: ${BREAKPOINTS.sm}px) and (max-width: ${BREAKPOINTS.md - 1}px)`,
  md: `@media (min-width: ${BREAKPOINTS.md}px) and (max-width: ${BREAKPOINTS.lg - 1}px)`,
  lg: `@media (min-width: ${BREAKPOINTS.lg}px)`,
  mobile: `@media (max-width: ${BREAKPOINTS.md - 1}px)`,
  desktop: `@media (min-width: ${BREAKPOINTS.md}px)`,
};

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/api/auth/register',
    ME: '/api/auth/me',
  },
  COURSES: {
    LIST: '/api/courses',
    DETAIL: (id) => `/api/courses/${id}`,
    VIDEOS: (courseId) => `/api/courses/${courseId}/videos`,
    ENROLL: (courseId) => `/api/courses/${courseId}/enroll`,
    CONFIRM: (courseId) => `/api/courses/${courseId}/enroll/confirm`,
    ENROLLED: '/api/courses/enrolled',
    CERTIFICATE: (courseId) => `/api/courses/${courseId}/certificate`,
  },
  VIDEOS: {
    PROGRESS: (videoId) => `/api/videos/${videoId}/progress`,
  },
  BLOGS: {
    LIST: '/api/blogs',
    DETAIL: (id) => `/api/blogs/${id}`,
  },
  ADMIN: {
    USERS: '/api/admin/users',
    USER_DETAIL: (id) => `/api/admin/users/${id}`,
    ANALYTICS: '/api/admin/analytics',
  },
};

// Local storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'uyir_auth',
  THEME: 'uyir_theme',
  LANGUAGE: 'uyir_lang',
};

// Route paths
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  COURSES: '/courses',
  COURSE_DETAIL: (id) => `/courses/${id}`,
  MY_COURSES: '/my-courses',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  CERTIFICATE_VERIFY: (id) => `/certificate/${id}`,
  ADMIN: {
    HOME: '/admin',
    COURSES: '/admin/courses',
    USERS: '/admin/users',
    ANALYTICS: '/admin/analytics',
  },
  INSTRUCTOR: {
    COURSES: '/instructor/courses',
  },
  UNAUTHORIZED: '/unauthorized',
  NOT_FOUND: '/404',
};

// Default values
export const DEFAULTS = {
  PAGINATION: {
    PAGE_SIZE: 12,
    INITIAL_PAGE: 1,
  },
  TOAST: {
    DURATION: 6000,
    POSITION: { vertical: 'top', horizontal: 'right' },
  },
  VIDEO: {
    PROGRESS_SAVE_INTERVAL: 10, // seconds
  },
};

// Validation rules
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 5000,
  BLOG_CONTENT_MAX_LENGTH: 10000,
};

// Course categories
export const COURSE_CATEGORIES = [
  'Programming',
  'Web Development',
  'Mobile Development',
  'Data Science',
  'Machine Learning',
  'DevOps',
  'Cloud Computing',
  'Cybersecurity',
  'Business',
  'Design',
  'Marketing',
  'Other',
];

// Currency
export const CURRENCY = {
  CODE: 'INR',
  SYMBOL: '₹',
  LOCALE: 'en-IN',
};
