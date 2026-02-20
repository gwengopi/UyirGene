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

// Create the dark theme
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

// Light theme palette — richer, warmer, more polished
const lightPalette = {
  mode: 'light',
  primary: {
    main: '#37474f',       // deeper blue-gray for stronger presence
    light: '#546e7a',
    dark: '#263238',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#607d8b',
    light: '#90a4ae',
    dark: '#455a64',
    contrastText: '#ffffff',
  },
  background: {
    default: '#eef1f6',    // cooler tinted base so white cards stand out
    paper: '#ffffff',
  },
  text: {
    primary: '#1a2027',    // near-black for sharp contrast
    secondary: '#556370',  // warmer gray for body text
    disabled: '#9e9e9e',
  },
  divider: 'rgba(0, 0, 0, 0.08)',
  error: {
    main: '#d32f2f',
    light: '#ef5350',
    dark: '#c62828',
  },
  success: {
    main: '#2e7d32',
    light: '#4caf50',
    dark: '#1b5e20',
  },
  warning: {
    main: '#ed6c02',
    light: '#ff9800',
    dark: '#e65100',
  },
  info: {
    main: '#0288d1',
    light: '#03a9f4',
    dark: '#01579b',
  },
  focus: {
    main: '#0288d1',
  },
};

// Light theme component overrides — polished, depth-rich, complete coverage
const lightComponents = {
  MuiCssBaseline: {
    styleOverrides: {
      body: {
        backgroundColor: '#eef1f6',
        color: '#1a2027',
        scrollBehavior: 'smooth',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
      },
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
          backgroundColor: '#ffffff',
          color: '#1a2027',
          zIndex: 9999,
          borderRadius: '4px',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.12)',
          outline: '2px solid #0288d1',
          outlineOffset: '2px',
        },
      },
      '*:focus-visible': {
        outline: '2px solid #0288d1',
        outlineOffset: '2px',
      },
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
        backgroundColor: '#ffffff',
        backgroundImage: 'none',
        boxShadow: '0 1px 4px rgba(69,90,100,0.08), 0 2px 12px rgba(69,90,100,0.06)',
        border: '1px solid rgba(69,90,100,0.1)',
        transition: 'box-shadow 0.3s ease-in-out, transform 0.2s ease-in-out',
        '&:hover': {
          boxShadow: '0 4px 16px rgba(69,90,100,0.12), 0 8px 32px rgba(69,90,100,0.08)',
        },
        '&:focus-within': {
          outline: '2px solid #0288d1',
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
        backgroundColor: '#263238',
        backgroundImage: 'linear-gradient(135deg, #263238 0%, #37474f 100%)',
        boxShadow: '0 1px 4px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)',
      },
    },
  },
  MuiButton: {
    styleOverrides: {
      root: {
        textTransform: 'none',
        fontWeight: 600,
        borderRadius: '8px',
        padding: '8px 16px',
        minHeight: '44px',
        letterSpacing: '0.01em',
        '&:focus-visible': {
          outline: '2px solid #0288d1',
          outlineOffset: '2px',
        },
      },
      contained: {
        backgroundColor: '#37474f',
        color: '#ffffff',
        boxShadow: '0 2px 4px rgba(55,71,79,0.25)',
        '&:hover': {
          backgroundColor: '#455a64',
          boxShadow: '0 4px 12px rgba(55,71,79,0.3)',
        },
        '&:disabled': {
          backgroundColor: 'rgba(55,71,79,0.35)',
          color: 'rgba(255,255,255,0.6)',
        },
      },
      outlined: {
        borderColor: '#b0bec5',
        color: '#37474f',
        '&:hover': {
          borderColor: '#546e7a',
          backgroundColor: 'rgba(55,71,79,0.04)',
        },
      },
    },
  },
  MuiIconButton: {
    styleOverrides: {
      root: {
        minWidth: '44px',
        minHeight: '44px',
        '&:focus-visible': {
          outline: '2px solid #0288d1',
          outlineOffset: '2px',
        },
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        backgroundColor: '#ffffff',
        backgroundImage: 'none',
        border: '1px solid rgba(69,90,100,0.1)',
      },
      elevation0: {
        boxShadow: 'none',
      },
      elevation1: {
        boxShadow: '0 1px 4px rgba(69,90,100,0.08), 0 2px 8px rgba(69,90,100,0.06)',
      },
      elevation2: {
        boxShadow: '0 2px 8px rgba(69,90,100,0.1), 0 4px 16px rgba(69,90,100,0.06)',
      },
      elevation4: {
        boxShadow: '0 4px 12px rgba(69,90,100,0.1), 0 8px 24px rgba(69,90,100,0.08)',
      },
      elevation8: {
        boxShadow: '0 8px 24px rgba(69,90,100,0.12), 0 16px 48px rgba(69,90,100,0.08)',
      },
    },
  },
  MuiTextField: {
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          backgroundColor: '#ffffff',
          '& fieldset': {
            borderColor: '#cfd8dc',
          },
          '&:hover fieldset': {
            borderColor: '#90a4ae',
          },
          '&.Mui-focused fieldset': {
            borderColor: '#37474f',
            borderWidth: '2px',
          },
          '&.Mui-error fieldset': {
            borderColor: '#d32f2f',
          },
        },
        '& .MuiInputLabel-root': {
          color: '#78909c',
          '&.Mui-focused': {
            color: '#37474f',
          },
          '&.Mui-error': {
            color: '#d32f2f',
          },
        },
        '& .MuiFormHelperText-root': {
          marginLeft: 0,
          '&.Mui-error': {
            color: '#d32f2f',
          },
        },
      },
    },
  },
  MuiDialog: {
    styleOverrides: {
      paper: {
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 16px 48px rgba(0,0,0,0.08)',
      },
    },
  },
  MuiDrawer: {
    styleOverrides: {
      paper: {
        backgroundColor: '#ffffff',
        borderRight: '1px solid rgba(0,0,0,0.08)',
        boxShadow: '4px 0 16px rgba(0,0,0,0.06)',
      },
    },
  },
  MuiLink: {
    styleOverrides: {
      root: {
        color: '#0277bd',
        textDecoration: 'none',
        '&:hover': {
          textDecoration: 'underline',
          color: '#01579b',
        },
        '&:focus-visible': {
          outline: '2px solid #0288d1',
          outlineOffset: '2px',
        },
      },
    },
  },
  MuiListItemButton: {
    styleOverrides: {
      root: {
        minHeight: '44px',
        '&.Mui-selected': {
          backgroundColor: 'rgba(55,71,79,0.08)',
          '&:hover': {
            backgroundColor: 'rgba(55,71,79,0.12)',
          },
        },
        '&:focus-visible': {
          outline: '2px solid #0288d1',
          outlineOffset: '-2px',
        },
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        fontWeight: 500,
        '&:focus-visible': {
          outline: '2px solid #0288d1',
          outlineOffset: '2px',
        },
      },
      outlined: {
        borderColor: '#b0bec5',
      },
    },
  },
  MuiTab: {
    styleOverrides: {
      root: {
        minHeight: '44px',
        textTransform: 'none',
        fontWeight: 500,
        '&:focus-visible': {
          outline: '2px solid #0288d1',
          outlineOffset: '2px',
        },
      },
    },
  },
  MuiTableCell: {
    styleOverrides: {
      root: {
        borderBottom: '1px solid rgba(0,0,0,0.08)',
      },
      head: {
        fontWeight: 600,
        backgroundColor: '#f1f3f5',
        color: '#37474f',
      },
    },
  },
  MuiLinearProgress: {
    styleOverrides: {
      root: {
        borderRadius: '4px',
        backgroundColor: 'rgba(55,71,79,0.1)',
      },
      bar: {
        borderRadius: '4px',
      },
    },
  },
  MuiSkeleton: {
    styleOverrides: {
      root: {
        backgroundColor: 'rgba(0,0,0,0.06)',
      },
    },
  },
  MuiAlert: {
    styleOverrides: {
      root: {
        borderRadius: '8px',
      },
      standardError: {
        backgroundColor: '#fef2f2',
        color: '#c62828',
        border: '1px solid #fecaca',
      },
      standardSuccess: {
        backgroundColor: '#f0fdf4',
        color: '#1b5e20',
        border: '1px solid #bbf7d0',
      },
      standardWarning: {
        backgroundColor: '#fffbeb',
        color: '#e65100',
        border: '1px solid #fed7aa',
      },
      standardInfo: {
        backgroundColor: '#eff6ff',
        color: '#01579b',
        border: '1px solid #bfdbfe',
      },
    },
  },
  MuiBreadcrumbs: {
    styleOverrides: {
      separator: {
        color: '#90a4ae',
      },
    },
  },
  MuiDivider: {
    styleOverrides: {
      root: {
        borderColor: 'rgba(0,0,0,0.06)',
      },
    },
  },
  MuiTooltip: {
    styleOverrides: {
      tooltip: {
        backgroundColor: '#263238',
        fontSize: '0.75rem',
      },
      arrow: {
        color: '#263238',
      },
    },
  },
};

// Light typography — sharper contrast, warmer secondary text
const lightTypography = {
  ...typography,
  h4: {
    ...typography.h4,
    color: '#1a2027',
  },
  h5: {
    ...typography.h5,
    color: '#1a2027',
  },
  h6: {
    ...typography.h6,
    color: '#1a2027',
  },
  body1: {
    ...typography.body1,
    color: '#556370',
  },
  body2: {
    ...typography.body2,
    color: '#556370',
  },
  caption: {
    ...typography.caption,
    color: '#90a4ae',
  },
};

// Create the light theme
export const lightTheme = createTheme({
  breakpoints,
  palette: lightPalette,
  typography: lightTypography,
  components: lightComponents,
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
