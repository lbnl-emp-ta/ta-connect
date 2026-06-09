import { Typography } from '@mui/material';
import { TACustomer } from '@/api/dashboard/types';

interface CustomersDataHeaderProps {
  customers: TACustomer[] | null;
}

export const CustomersDataHeader: React.FC<CustomersDataHeaderProps> = ({ customers }) => {
  if (customers === null) {
    return <Typography sx={{ flex: 1, mx: 0.5 }}>Loading...</Typography>;
  }
  return (
    <Typography sx={{ flex: 1, mx: 0.5 }}>
      {customers.length} {customers.length === 1 ? 'customer' : 'customers'}
    </Typography>
  );
};
