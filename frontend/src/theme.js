import { createTheme } from '@mui/material/styles';

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: 'rgb(79, 102, 114)',
      light: 'rgb(100, 130, 145)',
      dark: 'rgb(50, 70, 85)',
    },
    secondary: {
      main: 'rgb(164, 164, 164)',
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
    },
    success: {
      main: '#4caf50',
    },
    warning: {
      main: '#ff9800',
    },
    info: {
      main: '#2196f3',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
      color: 'rgb(255, 255, 255)',
    },
    h5: {
      fontWeight: 500,
      color: 'rgb(255, 255, 255)',
    },
    h6: {
      fontWeight: 500,
      color: 'rgb(255, 255, 255)',
    },
    body1: {
      color: 'rgb(226, 226, 226)',
    },
    body2: {
      color: 'rgb(226, 226, 226)',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: 'rgb(22, 22, 22)',
          color: 'rgb(255, 255, 255)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgb(30, 30, 30)',
          backgroundImage: 'none',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
          transition: 'box-shadow 0.3s ease-in-out',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.6)',
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
        },
        contained: {
          backgroundColor: 'rgb(69, 90, 100)',
          color: 'rgb(255, 255, 255)',
          '&:hover': {
            backgroundColor: 'rgb(79, 102, 114)',
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
            },
          },
          '& .MuiInputLabel-root': {
            color: 'rgb(164, 164, 164)',
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
  },
});
