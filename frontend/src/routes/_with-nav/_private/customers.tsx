import { customersQueryOptions } from '@/api/queryOptions';
import { CustomersDataTable } from '@/features/customers/CustomersDataTable';
import { Box, Button, Container, IconButton, Stack, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { CustomerEditDialog } from '@/features/customers/CustomerEditDialog';
import { useState } from 'react';
import { TACustomer } from '@/api/dashboard/types';
import { GridColDef } from '@mui/x-data-grid';

export const Route = createFileRoute('/_with-nav/_private/customers')({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(customersQueryOptions());
  },
  component: CustomersPage,
});

function CustomersPage() {
  const { data: customers } = useSuspenseQuery(customersQueryOptions());
  const [customerEditDialogOpen, setCustomerEditDialogOpen] = useState(false);
  // const [customerDeleteDialogOpen, setCustomerDeleteDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<TACustomer>();

  const handleRowEdit = (customer: TACustomer) => {
    setSelectedCustomer(customer);
    setCustomerEditDialogOpen(true);
  };

  const handleAddCustomer = () => {
    setSelectedCustomer(undefined);
    setCustomerEditDialogOpen(true);
  };

  const customerColumns: GridColDef[] = [
    { field: 'name', headerName: 'Name', width: 200 },
    { field: 'email', headerName: 'Email', width: 200 },
    { field: 'title', headerName: 'Job Title', width: 200 },
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
    {
      field: 'edit',
      headerName: 'Actions',
      width: 150,
      type: 'custom',
      align: 'center',
      headerAlign: 'center',
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: (params) => (
        <Stack direction="row" spacing={1} sx={{ height: '100%' }} justifyContent="center">
          <Box>
            <IconButton
              color="primary"
              size="small"
              onClick={() => handleRowEdit(params.row as TACustomer)}
            >
              <EditIcon />
            </IconButton>
          </Box>
          {/* <Box>
            <IconButton color="primary" size="small">
              <DeleteIcon />
            </IconButton>
          </Box> */}
        </Stack>
      ),
    },
  ];

  return (
    <Container maxWidth="xl" sx={{ paddingTop: 3, paddingBottom: 3 }}>
      <Stack>
        <Stack direction="row">
          <Typography variant="h3" component="h1" fontWeight="bold" sx={{ flexGrow: 1 }}>
            Customers
          </Typography>
          <Stack justifyContent="center">
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddCustomer}>
              Add a customer
            </Button>
          </Stack>
        </Stack>
        <CustomersDataTable customers={customers} columns={customerColumns} />
      </Stack>
      <CustomerEditDialog
        open={customerEditDialogOpen}
        onClose={() => setCustomerEditDialogOpen(false)}
        customer={selectedCustomer}
      />
    </Container>
  );
}
