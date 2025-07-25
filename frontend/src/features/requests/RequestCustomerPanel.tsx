import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
} from '@mui/material';
import { TACustomer } from '../../api/dashboard/types';
import { InfoPanel } from '../../components/InfoPanel';

interface RequestInfoTableProps {
  customer?: TACustomer;
}

export const RequestCustomerPanel: React.FC<RequestInfoTableProps> = ({ customer }) => {
  return (
    <InfoPanel header="Customer Information">
      {!customer && (
        <Box>
          <Typography>No customer data to show.</Typography>
        </Box>
      )}
      {customer && (
        <TableContainer>
          <Table size="small">
            <TableBody>
              <TableRow>
                <TableCell>Relationship</TableCell>
                {/* TODO: Implement relationship in the API */}
                <TableCell>Unknown</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>{customer.name}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Email</TableCell>
                <TableCell>{customer.email}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Phone</TableCell>
                <TableCell>{customer.phone}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Job Title</TableCell>
                <TableCell>{customer.title}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Organization</TableCell>
                {/* TODO: Implement nested organization data in the API */}
                <TableCell>{customer.org.name}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>State</TableCell>
                {/* TODO: Return state name instead of ID in the API */}
                <TableCell>{customer.state.name}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </InfoPanel>
  );
};
