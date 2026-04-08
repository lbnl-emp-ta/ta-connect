import { createTheme } from '@mui/material';
import type {} from '@mui/x-data-grid/themeAugmentation';

/**
 * MUI Theme object for setting app-wide and component-wide styles.
 * Specify colors, spacing, fonts, and more.
 * Learn more about theme options: https://mui.com/material-ui/customization/theming/
 */
export const theme = createTheme({
  // Color palette to use throughout the app
  palette: {
    mode: 'light',
    background: {
      default: '#F5F5F6',
      paper: '#fff',
    },
    primary: {
      main: '#345a64',
      // Exclude light, dark, or contrastText to have them
      // calculated automatically based on the main color.
      light: '#D6E6EA',
      dark: '#0f172a',
      contrastText: '#fff',
    },
    secondary: {
      main: '#C45BAA',
      contrastText: '#fff',
    },
    info: {
      main: '#38AECC',
    },
    success: {
      main: '#74AA50',
    },
    warning: {
      main: '#FAD038',
    },
    error: {
      main: '#FF8370',
    },
    common: {
      black: '#000',
      white: '#fff',
    },
    grey: {
      50: '#eee',
      100: '#ddd',
      500: '#999',
      900: '#444',
    },
  },
  // Control the default border radius
  shape: {
    borderRadius: 4,
  },
  // Control the font, size, and font weights
  typography: {
    htmlFontSize: 16,
    fontFamily: `"Avenir", "Helvetica", "Verdana", "Arial", sans-serif`,
    fontSize: 14,
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
  },
  // Default options for MUI components used throughout the app
  components: {
    /**
     * Example component customization.
     * Learn more at https://mui.com/material-ui/customization/theme-components/
     * 
        MuiComponentName: {
          defaultProps: {
            // Put prop names and values here
          },
          styleOverrides: {
            root: {
              // Put styles here
            }
          },
          // Create new custom variants of certain components
          variants: [
            {
              props: { variant: '' },
              style: {
                // Put styles here
              },
            },
          ],
        },
     *
     */
    MuiLink: {
      styleOverrides: {
        root: {
          textDecoration: 'none',
        },
      },
    },
    MuiStack: {
      defaultProps: {
        spacing: 2,
      },
    },
    MuiDataGrid: {
      styleOverrides: {
        root: {
          border: 0,
          '& .MuiDataGrid-cell:focus-within': {
            outline: 'none',
          },
          '& .MuiDataGrid-overlayWrapper': {
            minHeight: '4rem',
          },
          '& .MuiDataGrid-columnHeaderTitle': {
            color: 'grey.900',
            fontSize: '0.85rem',
            fontWeight: 'bold',
            textTransform: 'uppercase',
          },
        },
      },
    },
    MuiSnackbar: {
      styleOverrides: {
        root: {
          '& .MuiSnackbarContent-root': {
            flexWrap: 'nowrap',
          },
        },
      },
    },
  },
});
