import { TACustomer, TAExpert, TAOrganization } from './api/dashboard/types';

declare module '@mui/x-data-grid' {
  interface ToolbarPropsOverrides {
    experts: TAExpert[] | null;
    customers: TACustomer[] | null;
    organizations: TAOrganization[] | null;
  }
}
