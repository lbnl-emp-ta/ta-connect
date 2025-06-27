import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
} from '@mui/material';
import { TACustomer } from '../../api/dashboard/types';

interface RequestInfoTableProps {
  customer?: TACustomer;
}

export const RequestAttachments: React.FC<RequestInfoTableProps> = ({ customer }) => {
  return (
    <Paper
      sx={{
        height: 'stretch',
        width: 'stretch',
        borderWidth: 10,
        borderStyle: 'solid',
        borderColor: 'primary.main',
        borderRadius: 0,
        borderTopLeftRadius: 5,
        borderTopRightRadius: 5,
      }}
    >
      <Typography
        component="h3"
        sx={{
          textAlign: 'center',
          backgroundColor: 'primary.main',
          color: 'primary.contrastText',
          paddingBottom: 1,
        }}
      >
        Customer Information
      </Typography>
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
                <TableCell>{customer.org}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>State</TableCell>
                {/* TODO: Return state name instead of ID in the API */}
                <TableCell>{customer.state}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
};
