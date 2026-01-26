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
  VERIFY_CERTIFICATE: '/verify-certificate',
  CERTIFICATE_VERIFY: (id) => `/certificate/${id}`,
  ADMIN: {
    HOME: '/admin',
    COURSES: '/admin/courses',
    BLOGS: '/admin/blogs',
    USERS: '/admin/users',
    ANALYTICS: '/admin/analytics',
    SETTINGS: '/admin/settings',
    CERTIFICATE_TEMPLATES: '/admin/certificate-templates',
  },
  INSTRUCTOR: {
    COURSES: '/instructor/courses',
  },
  UNAUTHORIZED: '/unauthorized',
  PAYMENT: '/payment',
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

// Images from Uyirgene website
export const IMAGES = {
  // Logo
  LOGO: 'https://img1.wsimg.com/isteam/ip/1026513f-a4fe-4205-ac72-b744196cbd6f/UI_color-removebg-preview%202.png/:/rs=h:80,cg:true,m/qt=q:100/ll',
  LOGO_SMALL: 'https://img1.wsimg.com/isteam/ip/1026513f-a4fe-4205-ac72-b744196cbd6f/UI_color-removebg-preview%202.png/:/rs=h:40,cg:true,m/qt=q:100/ll',

  // Hero images
  HERO_MAIN: 'https://img1.wsimg.com/isteam/ip/1026513f-a4fe-4205-ac72-b744196cbd6f/blob-91a7f99.png/:/rs=w:1920,h:1080,cg:true,m/qt=q:95',
  HERO_STUDENTS: 'https://img1.wsimg.com/isteam/getty/1392049389/:/rs=w:1280,h:720,cg:true,m/qt=q:90',
  HERO_LEARNING: 'https://img1.wsimg.com/isteam/getty/2246976642/:/rs=w:1280,h:720,cg:true,m/qt=q:90',
  HERO_TECHNOLOGY: 'https://img1.wsimg.com/isteam/getty/2217587857/:/rs=w:1280,h:720,cg:true,m/qt=q:90',

  // Course feature images
  COURSE_REGULATORY: 'https://img1.wsimg.com/isteam/getty/2165387046/:/rs=w:600,h:400,cg:true,m/qt=q:90',
  COURSE_TRAINERS: 'https://img1.wsimg.com/isteam/getty/2156390491/:/rs=w:600,h:400,cg:true,m/qt=q:90',
  COURSE_PRACTICAL: 'https://img1.wsimg.com/isteam/getty/1938554573/:/rs=w:600,h:400,cg:true,m/qt=q:90',
  COURSE_CERTIFICATION: 'https://img1.wsimg.com/isteam/getty/1341288264/:/rs=w:600,h:400,cg:true,m/qt=q:90',

  // About section images
  ABOUT_TEAM: 'https://img1.wsimg.com/isteam/getty/1754192862/:/rs=w:800,h:600,cg:true,m/qt=q:90',
  ABOUT_MISSION: 'https://img1.wsimg.com/isteam/getty/852586044/:/rs=w:800,h:600,cg:true,m/qt=q:90',
  ABOUT_VISION: 'https://img1.wsimg.com/isteam/getty/2193981513/:/rs=w:800,h:600,cg:true,m/qt=q:90',

  // Background images
  BG_GRADIENT: 'https://img1.wsimg.com/isteam/getty/158649166/:/rs=w:1920,h:1080,cg:true,m/qt=q:90',
  BG_TECHNOLOGY: 'https://img1.wsimg.com/isteam/getty/2210258491/:/rs=w:1920,h:1080,cg:true,m/qt=q:90',

  // Stock images
  STOCK_OFFICE: 'https://img1.wsimg.com/isteam/stock/28704/:/rs=w:600,h:400,cg:true,m/qt=q:90',
  STOCK_MEETING: 'https://img1.wsimg.com/isteam/stock/4195/:/rs=w:600,h:400,cg:true,m/qt=q:90',

  // Placeholders
  COURSE_PLACEHOLDER: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
  USER_PLACEHOLDER: 'https://img1.wsimg.com/isteam/getty/1754192862/:/rs=w:200,h:200,cg:true,m/qt=q:85',
};
