import { createTheme, Shadows } from '@mui/material';
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
      main: '#13b8a6',
      light: '#f0fdfa',
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
  shadows: [
    'none',
    '0 1px 2px 0 rgb(0, 0, 0, 0.14)',
    '0 2px 4px -1px rgb(0, 0, 0, 0.14), 0 4px 5px 0 rgb(0, 0, 0, 0.12)',
    '0 3px 5px -1px rgb(0, 0, 0, 0.14), 0 6px 10px 0 rgb(0, 0, 0, 0.12)',
    '0 4px 5px -2px rgb(0, 0, 0, 0.14), 0 8px 10px 1px rgb(0, 0, 0, 0.12)',
    '0 5px 5px -3px rgb(0, 0, 0, 0.14), 0 10px 14px 1px rgb(0, 0, 0, 0.12)',
    '0 6px 6px -3px rgb(0, 0, 0, 0.14), 0 12px 17px 2px rgb(0, 0, 0, 0.12)',
    '0 7px 8px -4px rgb(0, 0, 0, 0.14), 0 14px 21px 2px rgb(0, 0, 0, 0.12)',
    '0 8px 9px -5px rgb(0, 0, 0, 0.14), 0 16px 24px 2px rgb(0, 0, 0, 0.12)',
    '0 9px 10px -5px rgb(0, 0, 0, 0.14), 0 18px 28px 2px rgb(0, 0, 0, 0.12)',
    '0 10px 11px -6px rgb(0, 0, 0, 0.14), 0 20px 31px 3px rgb(0, 0, 0, 0.12)',
    '0 11px 15px -7px rgb(0, 0, 0, 0.14), 0 22px 38px 3px rgb(0, 0, 0, 0.12)',
    '0 12px 17px -7px rgb(0, 0, 0, 0.14), 0 24px 40px 3px rgb(0, 0, 0, 0.12)',
    '0 13px 19px -8px rgb(0, 0, 0, 0.14), 0 26px 44px 4px rgb(0, 0, 0, 0.12)',
    '0 14px 21px -8px rgb(0, 0, 0, 0.14), 0 28px 45px 4px rgb(0, 0, 0, 0.12)',
    '0 15px 22px -9px rgb(0, 0, 0, 0.14), 0 30px 46px 4px rgb(0, 0, 0, 0.12)',
    ...Array(9).fill('0 15px 22px -9px rgb(0, 0, 0, 0.14), 0 30px 46px 4px rgb(0, 0, 0, 0.12)'),
  ] as Shadows,
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
