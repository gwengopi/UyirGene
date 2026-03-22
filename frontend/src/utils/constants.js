// Google OAuth
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

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
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  SERVICES: '/services',
  SERVICES_MICROBIOLOGY: '/services/microbiology-research',
  SERVICES_CERTIFICATION: '/services/certification',
  SERVICES_TESTING: '/services/testing',
  SERVICES_CLINICAL_RESEARCH: '/services/clinical-research',
  SERVICES_LEARNING: '/courses',
  COURSES: '/courses',
  COURSES_FLAGSHIP: '/courses/flagship',
  COURSES_CATEGORY: (code) => `/courses/category/${code}`,
  COURSE_DETAIL: (slug) => `/courses/${slug}`,
  BUNDLE_DETAIL: (slug) => `/bundles/${slug}`,
  FLAGSHIP_DETAIL: (slug) => `/flagship/${slug}`,
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
    BUNDLES: '/admin/bundles',
    MAIL_TEMPLATES: '/admin/mail-templates',
    FLAGSHIP_PROGRAMS: '/admin/flagship-programs',
    MARKETING_CAMPAIGNS: '/admin/marketing-campaigns',
    STANDARDS: '/admin/standards',
    CERT_SETTINGS: '/admin/cert-settings',
    VISITORS: '/admin/visitors',
  },
  STANDARDS: '/standards',
  INSTRUCTOR: {
    COURSES: '/instructor/courses',
  },
  UNAUTHORIZED: '/unauthorized',
  PAYMENT: '/payment',
  NOT_FOUND: '/404',
  UNSUBSCRIBE: '/unsubscribe',
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
  CODE: 'USD',
  SYMBOL: '$',
  LOCALE: 'en-US',
};

// Supported countries for multi-currency pricing
export const SUPPORTED_COUNTRIES = [
  { code: 'IN', name: 'India', currency: 'INR', symbol: '₹', locale: 'en-IN' },
  { code: 'AF', name: 'Afghanistan', currency: 'AFN', symbol: '؋', locale: 'ps-AF' },
  { code: 'AL', name: 'Albania', currency: 'ALL', symbol: 'L', locale: 'sq-AL' },
  { code: 'DZ', name: 'Algeria', currency: 'DZD', symbol: 'د.ج', locale: 'ar-DZ' },
  { code: 'AR', name: 'Argentina', currency: 'ARS', symbol: '$', locale: 'es-AR' },
  { code: 'AM', name: 'Armenia', currency: 'AMD', symbol: '֏', locale: 'hy-AM' },
  { code: 'AU', name: 'Australia', currency: 'AUD', symbol: 'A$', locale: 'en-AU' },
  { code: 'AT', name: 'Austria', currency: 'EUR', symbol: '€', locale: 'de-AT' },
  { code: 'AZ', name: 'Azerbaijan', currency: 'AZN', symbol: '₼', locale: 'az-AZ' },
  { code: 'BH', name: 'Bahrain', currency: 'BHD', symbol: '.د.ب', locale: 'ar-BH' },
  { code: 'BD', name: 'Bangladesh', currency: 'BDT', symbol: '৳', locale: 'bn-BD' },
  { code: 'BY', name: 'Belarus', currency: 'BYN', symbol: 'Br', locale: 'be-BY' },
  { code: 'BE', name: 'Belgium', currency: 'EUR', symbol: '€', locale: 'nl-BE' },
  { code: 'BT', name: 'Bhutan', currency: 'BTN', symbol: 'Nu', locale: 'dz-BT' },
  { code: 'BO', name: 'Bolivia', currency: 'BOB', symbol: 'Bs', locale: 'es-BO' },
  { code: 'BR', name: 'Brazil', currency: 'BRL', symbol: 'R$', locale: 'pt-BR' },
  { code: 'BN', name: 'Brunei', currency: 'BND', symbol: 'B$', locale: 'ms-BN' },
  { code: 'BG', name: 'Bulgaria', currency: 'BGN', symbol: 'лв', locale: 'bg-BG' },
  { code: 'KH', name: 'Cambodia', currency: 'KHR', symbol: '៛', locale: 'km-KH' },
  { code: 'CA', name: 'Canada', currency: 'CAD', symbol: 'C$', locale: 'en-CA' },
  { code: 'CL', name: 'Chile', currency: 'CLP', symbol: '$', locale: 'es-CL' },
  { code: 'CN', name: 'China', currency: 'CNY', symbol: '¥', locale: 'zh-CN' },
  { code: 'CO', name: 'Colombia', currency: 'COP', symbol: '$', locale: 'es-CO' },
  { code: 'CR', name: 'Costa Rica', currency: 'CRC', symbol: '₡', locale: 'es-CR' },
  { code: 'HR', name: 'Croatia', currency: 'EUR', symbol: '€', locale: 'hr-HR' },
  { code: 'CY', name: 'Cyprus', currency: 'EUR', symbol: '€', locale: 'el-CY' },
  { code: 'CZ', name: 'Czech Republic', currency: 'CZK', symbol: 'Kč', locale: 'cs-CZ' },
  { code: 'DK', name: 'Denmark', currency: 'DKK', symbol: 'kr', locale: 'da-DK' },
  { code: 'DO', name: 'Dominican Republic', currency: 'DOP', symbol: 'RD$', locale: 'es-DO' },
  { code: 'EC', name: 'Ecuador', currency: 'USD', symbol: '$', locale: 'es-EC' },
  { code: 'EG', name: 'Egypt', currency: 'EGP', symbol: 'E£', locale: 'ar-EG' },
  { code: 'EE', name: 'Estonia', currency: 'EUR', symbol: '€', locale: 'et-EE' },
  { code: 'ET', name: 'Ethiopia', currency: 'ETB', symbol: 'Br', locale: 'am-ET' },
  { code: 'FI', name: 'Finland', currency: 'EUR', symbol: '€', locale: 'fi-FI' },
  { code: 'FR', name: 'France', currency: 'EUR', symbol: '€', locale: 'fr-FR' },
  { code: 'GE', name: 'Georgia', currency: 'GEL', symbol: '₾', locale: 'ka-GE' },
  { code: 'DE', name: 'Germany', currency: 'EUR', symbol: '€', locale: 'de-DE' },
  { code: 'GH', name: 'Ghana', currency: 'GHS', symbol: 'GH₵', locale: 'en-GH' },
  { code: 'GR', name: 'Greece', currency: 'EUR', symbol: '€', locale: 'el-GR' },
  { code: 'GT', name: 'Guatemala', currency: 'GTQ', symbol: 'Q', locale: 'es-GT' },
  { code: 'HK', name: 'Hong Kong', currency: 'HKD', symbol: 'HK$', locale: 'zh-HK' },
  { code: 'HU', name: 'Hungary', currency: 'HUF', symbol: 'Ft', locale: 'hu-HU' },
  { code: 'IS', name: 'Iceland', currency: 'ISK', symbol: 'kr', locale: 'is-IS' },
  { code: 'ID', name: 'Indonesia', currency: 'IDR', symbol: 'Rp', locale: 'id-ID' },
  { code: 'IR', name: 'Iran', currency: 'IRR', symbol: '﷼', locale: 'fa-IR' },
  { code: 'IQ', name: 'Iraq', currency: 'IQD', symbol: 'ع.د', locale: 'ar-IQ' },
  { code: 'IE', name: 'Ireland', currency: 'EUR', symbol: '€', locale: 'en-IE' },
  { code: 'IL', name: 'Israel', currency: 'ILS', symbol: '₪', locale: 'he-IL' },
  { code: 'IT', name: 'Italy', currency: 'EUR', symbol: '€', locale: 'it-IT' },
  { code: 'JM', name: 'Jamaica', currency: 'JMD', symbol: 'J$', locale: 'en-JM' },
  { code: 'JP', name: 'Japan', currency: 'JPY', symbol: '¥', locale: 'ja-JP' },
  { code: 'JO', name: 'Jordan', currency: 'JOD', symbol: 'د.ا', locale: 'ar-JO' },
  { code: 'KZ', name: 'Kazakhstan', currency: 'KZT', symbol: '₸', locale: 'kk-KZ' },
  { code: 'KE', name: 'Kenya', currency: 'KES', symbol: 'KSh', locale: 'en-KE' },
  { code: 'KR', name: 'South Korea', currency: 'KRW', symbol: '₩', locale: 'ko-KR' },
  { code: 'KW', name: 'Kuwait', currency: 'KWD', symbol: 'د.ك', locale: 'ar-KW' },
  { code: 'LA', name: 'Laos', currency: 'LAK', symbol: '₭', locale: 'lo-LA' },
  { code: 'LV', name: 'Latvia', currency: 'EUR', symbol: '€', locale: 'lv-LV' },
  { code: 'LB', name: 'Lebanon', currency: 'LBP', symbol: 'ل.ل', locale: 'ar-LB' },
  { code: 'LT', name: 'Lithuania', currency: 'EUR', symbol: '€', locale: 'lt-LT' },
  { code: 'LU', name: 'Luxembourg', currency: 'EUR', symbol: '€', locale: 'fr-LU' },
  { code: 'MO', name: 'Macau', currency: 'MOP', symbol: 'MOP$', locale: 'zh-MO' },
  { code: 'MY', name: 'Malaysia', currency: 'MYR', symbol: 'RM', locale: 'ms-MY' },
  { code: 'MV', name: 'Maldives', currency: 'MVR', symbol: 'Rf', locale: 'dv-MV' },
  { code: 'MT', name: 'Malta', currency: 'EUR', symbol: '€', locale: 'mt-MT' },
  { code: 'MU', name: 'Mauritius', currency: 'MUR', symbol: '₨', locale: 'en-MU' },
  { code: 'MX', name: 'Mexico', currency: 'MXN', symbol: 'Mex$', locale: 'es-MX' },
  { code: 'MN', name: 'Mongolia', currency: 'MNT', symbol: '₮', locale: 'mn-MN' },
  { code: 'MA', name: 'Morocco', currency: 'MAD', symbol: 'د.م.', locale: 'ar-MA' },
  { code: 'MM', name: 'Myanmar', currency: 'MMK', symbol: 'K', locale: 'my-MM' },
  { code: 'NP', name: 'Nepal', currency: 'NPR', symbol: 'रू', locale: 'ne-NP' },
  { code: 'NL', name: 'Netherlands', currency: 'EUR', symbol: '€', locale: 'nl-NL' },
  { code: 'NZ', name: 'New Zealand', currency: 'NZD', symbol: 'NZ$', locale: 'en-NZ' },
  { code: 'NG', name: 'Nigeria', currency: 'NGN', symbol: '₦', locale: 'en-NG' },
  { code: 'NO', name: 'Norway', currency: 'NOK', symbol: 'kr', locale: 'nb-NO' },
  { code: 'OM', name: 'Oman', currency: 'OMR', symbol: 'ر.ع.', locale: 'ar-OM' },
  { code: 'PK', name: 'Pakistan', currency: 'PKR', symbol: '₨', locale: 'ur-PK' },
  { code: 'PA', name: 'Panama', currency: 'PAB', symbol: 'B/.', locale: 'es-PA' },
  { code: 'PY', name: 'Paraguay', currency: 'PYG', symbol: '₲', locale: 'es-PY' },
  { code: 'PE', name: 'Peru', currency: 'PEN', symbol: 'S/', locale: 'es-PE' },
  { code: 'PH', name: 'Philippines', currency: 'PHP', symbol: '₱', locale: 'en-PH' },
  { code: 'PL', name: 'Poland', currency: 'PLN', symbol: 'zł', locale: 'pl-PL' },
  { code: 'PT', name: 'Portugal', currency: 'EUR', symbol: '€', locale: 'pt-PT' },
  { code: 'QA', name: 'Qatar', currency: 'QAR', symbol: 'ر.ق', locale: 'ar-QA' },
  { code: 'RO', name: 'Romania', currency: 'RON', symbol: 'lei', locale: 'ro-RO' },
  { code: 'RU', name: 'Russia', currency: 'RUB', symbol: '₽', locale: 'ru-RU' },
  { code: 'RW', name: 'Rwanda', currency: 'RWF', symbol: 'RF', locale: 'rw-RW' },
  { code: 'SA', name: 'Saudi Arabia', currency: 'SAR', symbol: 'ر.س', locale: 'ar-SA' },
  { code: 'RS', name: 'Serbia', currency: 'RSD', symbol: 'дин', locale: 'sr-RS' },
  { code: 'SG', name: 'Singapore', currency: 'SGD', symbol: 'S$', locale: 'en-SG' },
  { code: 'SK', name: 'Slovakia', currency: 'EUR', symbol: '€', locale: 'sk-SK' },
  { code: 'SI', name: 'Slovenia', currency: 'EUR', symbol: '€', locale: 'sl-SI' },
  { code: 'ZA', name: 'South Africa', currency: 'ZAR', symbol: 'R', locale: 'en-ZA' },
  { code: 'ES', name: 'Spain', currency: 'EUR', symbol: '€', locale: 'es-ES' },
  { code: 'LK', name: 'Sri Lanka', currency: 'LKR', symbol: 'Rs', locale: 'si-LK' },
  { code: 'SE', name: 'Sweden', currency: 'SEK', symbol: 'kr', locale: 'sv-SE' },
  { code: 'CH', name: 'Switzerland', currency: 'CHF', symbol: 'CHF', locale: 'de-CH' },
  { code: 'TW', name: 'Taiwan', currency: 'TWD', symbol: 'NT$', locale: 'zh-TW' },
  { code: 'TZ', name: 'Tanzania', currency: 'TZS', symbol: 'TSh', locale: 'sw-TZ' },
  { code: 'TH', name: 'Thailand', currency: 'THB', symbol: '฿', locale: 'th-TH' },
  { code: 'TR', name: 'Turkey', currency: 'TRY', symbol: '₺', locale: 'tr-TR' },
  { code: 'UG', name: 'Uganda', currency: 'UGX', symbol: 'USh', locale: 'en-UG' },
  { code: 'UA', name: 'Ukraine', currency: 'UAH', symbol: '₴', locale: 'uk-UA' },
  { code: 'AE', name: 'UAE', currency: 'AED', symbol: 'د.إ', locale: 'ar-AE' },
  { code: 'GB', name: 'United Kingdom', currency: 'GBP', symbol: '£', locale: 'en-GB' },
  { code: 'US', name: 'United States', currency: 'USD', symbol: '$', locale: 'en-US' },
  { code: 'UY', name: 'Uruguay', currency: 'UYU', symbol: '$U', locale: 'es-UY' },
  { code: 'UZ', name: 'Uzbekistan', currency: 'UZS', symbol: 'сўм', locale: 'uz-UZ' },
  { code: 'VN', name: 'Vietnam', currency: 'VND', symbol: '₫', locale: 'vi-VN' },
  { code: 'ZM', name: 'Zambia', currency: 'ZMW', symbol: 'ZK', locale: 'en-ZM' },
  { code: 'ZW', name: 'Zimbabwe', currency: 'ZWL', symbol: 'Z$', locale: 'en-ZW' },
];

// Images from Uyirgene website
export const IMAGES = {
  // Logo
  LOGO: 'https://img1.wsimg.com/isteam/ip/1026513f-a4fe-4205-ac72-b744196cbd6f/UI_color-removebg-preview%202.png/:/rs=h:80,cg:true,m/qt=q:100/ll',
  LOGO_SMALL: 'https://img1.wsimg.com/isteam/ip/1026513f-a4fe-4205-ac72-b744196cbd6f/UI_color-removebg-preview%202.png/:/rs=h:40,cg:true,m/qt=q:100/ll',
  FAVICON: 'https://uyirgene.com/favicon.ico',

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

  // Service images (configurable via admin)
  SERVICE_MICROBIOLOGY: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=600&h=400&fit=crop&q=80',
  SERVICE_CERTIFICATION: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&h=400&fit=crop&q=80',
  SERVICE_GMO_TESTING: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=600&h=400&fit=crop&q=80',
  SERVICE_CLINICAL_DIAGNOSTICS: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=600&h=400&fit=crop&q=80',
  SERVICE_LEARNING: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop&q=80',

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
