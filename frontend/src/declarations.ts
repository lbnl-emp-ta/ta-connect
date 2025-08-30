import { TAExpert } from './api/dashboard/types';

declare module '@mui/x-data-grid' {
  interface ToolbarPropsOverrides {
    experts: TAExpert[];
  }
}
