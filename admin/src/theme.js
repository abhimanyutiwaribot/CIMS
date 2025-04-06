import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1a1a1a',
      light: '#ffffff', // Changed from 'white' to '#ffffff'
      dark: '#000000',
    },
    secondary: {
      main: '#404040',
      light: '#666666',
      dark: '#262626',
    },
    success: {
      main: '#16a34a',
      light: '#22c55e',
      dark: '#15803d',
    },
    warning: {
      main: '#d97706',
      light: '#f59e0b',
      dark: '#b45309',
    },
    error: {
      main: '#dc2626',
      light: '#ef4444',
      dark: '#b91c1c',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#1a1a1a',
      secondary: '#666666',
    },
    divider: '#e2e8f0',
  },
  shape: {
    borderRadius: 12
  },
  typography: {
    fontFamily: 'Gilroy, -apple-system, BlinkMacSystemFont, sans-serif',
    h5: {
      fontFamily: 'Gilroy, -apple-system, BlinkMacSystemFont, sans-serif',
      fontWeight: 800
    }
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          border: '1px solid',
          borderColor: '#e2e8f0',
          backgroundImage: 'none'
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
          padding: '10px 20px'
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 500,
          padding: '4px 0'
        }
      }
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: '#e2e8f0',
          padding: '16px'
        },
        head: {
          fontWeight: 600,
          backgroundColor: '#f8fafc'
        }
      }
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          padding: '24px'
        }
      }
    }
  }
});

export default theme;
