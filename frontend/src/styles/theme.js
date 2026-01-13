import { createTheme } from '@mui/material/styles';

// Custom breakpoints matching requirements: 320px, 768px, 1024px, 1440px
const breakpoints = {
  values: {
    xs: 0,
    sm: 768,
    md: 1024,
    lg: 1440,
    xl: 1920,
  },
};

// Color palette
const palette = {
  mode: 'dark',
  primary: {
    main: 'rgb(79, 102, 114)',
    light: 'rgb(100, 130, 145)',
    dark: 'rgb(50, 70, 85)',
    contrastText: '#ffffff',
  },
  secondary: {
    main: 'rgb(164, 164, 164)',
    light: 'rgb(200, 200, 200)',
    dark: 'rgb(120, 120, 120)',
    contrastText: '#000000',
  },
  background: {
    default: 'rgb(22, 22, 22)',
    paper: 'rgb(30, 30, 30)',
  },
  text: {
    primary: 'rgb(255, 255, 255)',
    secondary: 'rgb(226, 226, 226)',
    disabled: 'rgb(164, 164, 164)',
  },
  divider: 'rgba(255, 255, 255, 0.12)',
  error: {
    main: '#f44336',
    light: '#e57373',
    dark: '#d32f2f',
  },
  success: {
    main: '#4caf50',
    light: '#81c784',
    dark: '#388e3c',
  },
  warning: {
    main: '#ff9800',
    light: '#ffb74d',
    dark: '#f57c00',
  },
  info: {
    main: '#2196f3',
    light: '#64b5f6',
    dark: '#1976d2',
  },
  // Custom colors for accessibility focus
  focus: {
    main: '#90caf9',
  },
};

// Typography settings
const typography = {
  fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  h1: {
    fontWeight: 700,
    fontSize: '2.5rem',
    lineHeight: 1.2,
    '@media (max-width: 768px)': {
      fontSize: '2rem',
    },
  },
  h2: {
    fontWeight: 600,
    fontSize: '2rem',
    lineHeight: 1.3,
    '@media (max-width: 768px)': {
      fontSize: '1.75rem',
    },
  },
  h3: {
    fontWeight: 600,
    fontSize: '1.75rem',
    lineHeight: 1.3,
    '@media (max-width: 768px)': {
      fontSize: '1.5rem',
    },
  },
  h4: {
    fontWeight: 600,
    fontSize: '1.5rem',
    lineHeight: 1.4,
    color: 'rgb(255, 255, 255)',
    '@media (max-width: 768px)': {
      fontSize: '1.25rem',
    },
  },
  h5: {
    fontWeight: 500,
    fontSize: '1.25rem',
    lineHeight: 1.4,
    color: 'rgb(255, 255, 255)',
    '@media (max-width: 768px)': {
      fontSize: '1.1rem',
    },
  },
  h6: {
    fontWeight: 500,
    fontSize: '1rem',
    lineHeight: 1.5,
    color: 'rgb(255, 255, 255)',
  },
  body1: {
    fontSize: '1rem',
    lineHeight: 1.6,
    color: 'rgb(226, 226, 226)',
  },
  body2: {
    fontSize: '0.875rem',
    lineHeight: 1.6,
    color: 'rgb(226, 226, 226)',
  },
  button: {
    textTransform: 'none',
    fontWeight: 500,
  },
  caption: {
    fontSize: '0.75rem',
    lineHeight: 1.5,
    color: 'rgb(164, 164, 164)',
  },
};

// Component overrides
const components = {
  MuiCssBaseline: {
    styleOverrides: {
      body: {
        backgroundColor: 'rgb(22, 22, 22)',
        color: 'rgb(255, 255, 255)',
        // Smooth scrolling
        scrollBehavior: 'smooth',
        // Better text rendering
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
      },
      // Skip link styles
      '.skip-link': {
        position: 'absolute',
        left: '-9999px',
        top: 'auto',
        width: '1px',
        height: '1px',
        overflow: 'hidden',
        '&:focus': {
          position: 'fixed',
          top: '10px',
          left: '10px',
          width: 'auto',
          height: 'auto',
          padding: '16px 24px',
          backgroundColor: 'rgb(30, 30, 30)',
          color: 'rgb(255, 255, 255)',
          zIndex: 9999,
          borderRadius: '4px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
          outline: '2px solid #90caf9',
          outlineOffset: '2px',
        },
      },
      // Focus visible styles for accessibility
      '*:focus-visible': {
        outline: '2px solid #90caf9',
        outlineOffset: '2px',
      },
      // Reduced motion preference
      '@media (prefers-reduced-motion: reduce)': {
        '*': {
          animationDuration: '0.01ms !important',
          animationIterationCount: '1 !important',
          transitionDuration: '0.01ms !important',
          scrollBehavior: 'auto !important',
        },
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        backgroundColor: 'rgb(30, 30, 30)',
        backgroundImage: 'none',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
        transition: 'box-shadow 0.3s ease-in-out, transform 0.2s ease-in-out',
        '&:hover': {
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.6)',
        },
        '&:focus-within': {
          outline: '2px solid #90caf9',
          outlineOffset: '2px',
        },
      },
    },
  },
  MuiCardActionArea: {
    styleOverrides: {
      root: {
        '&:focus-visible': {
          outline: 'none',
        },
      },
    },
  },
  MuiAppBar: {
    styleOverrides: {
      root: {
        backgroundColor: 'rgb(0, 0, 0)',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
      },
    },
  },
  MuiButton: {
    styleOverrides: {
      root: {
        textTransform: 'none',
        fontWeight: 500,
        borderRadius: '8px',
        padding: '8px 16px',
        minHeight: '44px', // Minimum touch target size for accessibility
        '&:focus-visible': {
          outline: '2px solid #90caf9',
          outlineOffset: '2px',
        },
      },
      contained: {
        backgroundColor: 'rgb(69, 90, 100)',
        color: 'rgb(255, 255, 255)',
        '&:hover': {
          backgroundColor: 'rgb(79, 102, 114)',
        },
        '&:disabled': {
          backgroundColor: 'rgba(69, 90, 100, 0.5)',
          color: 'rgba(255, 255, 255, 0.5)',
        },
      },
      outlined: {
        borderColor: 'rgba(255, 255, 255, 0.23)',
        color: 'rgb(255, 255, 255)',
        '&:hover': {
          borderColor: 'rgba(255, 255, 255, 0.4)',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
        },
      },
    },
  },
  MuiIconButton: {
    styleOverrides: {
      root: {
        minWidth: '44px', // Minimum touch target
        minHeight: '44px',
        '&:focus-visible': {
          outline: '2px solid #90caf9',
          outlineOffset: '2px',
        },
      },
    },
  },
  MuiTextField: {
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          '& fieldset': {
            borderColor: 'rgba(255, 255, 255, 0.23)',
          },
          '&:hover fieldset': {
            borderColor: 'rgba(255, 255, 255, 0.4)',
          },
          '&.Mui-focused fieldset': {
            borderColor: 'rgb(79, 102, 114)',
            borderWidth: '2px',
          },
          '&.Mui-error fieldset': {
            borderColor: '#f44336',
          },
        },
        '& .MuiInputLabel-root': {
          color: 'rgb(164, 164, 164)',
          '&.Mui-focused': {
            color: 'rgb(79, 102, 114)',
          },
          '&.Mui-error': {
            color: '#f44336',
          },
        },
        '& .MuiFormHelperText-root': {
          marginLeft: 0,
          '&.Mui-error': {
            color: '#f44336',
          },
        },
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        backgroundColor: 'rgb(30, 30, 30)',
        backgroundImage: 'none',
      },
    },
  },
  MuiDialog: {
    styleOverrides: {
      paper: {
        backgroundColor: 'rgb(30, 30, 30)',
        borderRadius: '12px',
      },
    },
  },
  MuiDrawer: {
    styleOverrides: {
      paper: {
        backgroundColor: 'rgb(22, 22, 22)',
        borderRight: '1px solid rgba(255, 255, 255, 0.12)',
      },
    },
  },
  MuiLink: {
    styleOverrides: {
      root: {
        color: '#90caf9',
        textDecoration: 'none',
        '&:hover': {
          textDecoration: 'underline',
        },
        '&:focus-visible': {
          outline: '2px solid #90caf9',
          outlineOffset: '2px',
        },
      },
    },
  },
  MuiListItemButton: {
    styleOverrides: {
      root: {
        minHeight: '44px', // Minimum touch target
        '&:focus-visible': {
          outline: '2px solid #90caf9',
          outlineOffset: '-2px',
        },
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        '&:focus-visible': {
          outline: '2px solid #90caf9',
          outlineOffset: '2px',
        },
      },
    },
  },
  MuiTab: {
    styleOverrides: {
      root: {
        minHeight: '44px', // Minimum touch target
        textTransform: 'none',
        '&:focus-visible': {
          outline: '2px solid #90caf9',
          outlineOffset: '2px',
        },
      },
    },
  },
  MuiTableCell: {
    styleOverrides: {
      root: {
        borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
      },
      head: {
        fontWeight: 600,
        backgroundColor: 'rgb(22, 22, 22)',
      },
    },
  },
  MuiLinearProgress: {
    styleOverrides: {
      root: {
        borderRadius: '4px',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
      },
      bar: {
        borderRadius: '4px',
      },
    },
  },
  MuiSkeleton: {
    styleOverrides: {
      root: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
      },
    },
  },
  MuiAlert: {
    styleOverrides: {
      root: {
        borderRadius: '8px',
      },
      standardError: {
        backgroundColor: 'rgba(244, 67, 54, 0.15)',
        color: '#f44336',
      },
      standardSuccess: {
        backgroundColor: 'rgba(76, 175, 80, 0.15)',
        color: '#4caf50',
      },
      standardWarning: {
        backgroundColor: 'rgba(255, 152, 0, 0.15)',
        color: '#ff9800',
      },
      standardInfo: {
        backgroundColor: 'rgba(33, 150, 243, 0.15)',
        color: '#2196f3',
      },
    },
  },
  MuiBreadcrumbs: {
    styleOverrides: {
      separator: {
        color: 'rgb(164, 164, 164)',
      },
    },
  },
};

// Create the theme
export const darkTheme = createTheme({
  breakpoints,
  palette,
  typography,
  components,
  shape: {
    borderRadius: 8,
  },
  spacing: 8,
});

// Export helper functions for responsive design
export const getResponsiveValue = (xs, sm, md, lg) => ({
  xs,
  sm: sm || xs,
  md: md || sm || xs,
  lg: lg || md || sm || xs,
});

export default darkTheme;
