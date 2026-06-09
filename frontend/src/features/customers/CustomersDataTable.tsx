import { Paper } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { TACustomer } from '../../api/dashboard/types';
import { CustomersToolbar } from './CustomersToolbar';

interface CustomersDataTableProps {
  customers: TACustomer[] | null;
  columns?: GridColDef[];
  elevation?: number;
}

export const customerColumns: GridColDef[] = [
  { field: 'name', headerName: 'Name', width: 200 },
  { field: 'email', headerName: 'Email', width: 200 },
  { field: 'title', headerName: 'Job Title', width: 175 },
  { field: 'phone', headerName: 'phone', width: 125 },
  {
    field: 'active_requests_count',
    headerName: 'Active Requests',
    width: 150,
    type: 'number',
  },
  {
    field: 'total_requests_count',
    headerName: 'Total Requests',
    width: 150,
    type: 'number',
  },
];

/**
 * Data table component for displaying customers.
 * Used in the Experts page and also in the request details page (as ExpertsPanelDataTable).
 */
export const CustomersDataTable: React.FC<CustomersDataTableProps> = ({
  customers,
  columns = customerColumns,
  elevation = 1,
}) => {
  return (
    <Paper elevation={elevation}>
      <DataGrid
        loading={customers === null}
        rows={customers || []}
        columns={columns}
        disableRowSelectionOnClick
        showToolbar
        slots={{ toolbar: CustomersToolbar }}
        slotProps={{ toolbar: { customers: customers } }}
        sx={{ backgroundColor: 'white' }}
      />
    </Paper>
  );
};
