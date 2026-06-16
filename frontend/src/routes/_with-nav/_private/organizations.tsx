import { organizationsQueryOptions } from '@/api/queryOptions';
import { OrganizationsDataTable } from '@/features/organizations/OrganizationsDataTable';
import { Box, Button, Container, IconButton, Stack, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { OrganizationEditDialog } from '@/features/organizations/OrganizationEditDialog';
import { useState } from 'react';
import { TAOrganization, TAOrganizationType } from '@/api/dashboard/types';
import { GridColDef } from '@mui/x-data-grid';
import { TransmissionPlanningRegion, State } from '@/api/forms/types';
import { useUser } from '@/hooks/useUser';

export const Route = createFileRoute('/_with-nav/_private/organizations')({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(organizationsQueryOptions());
  },
  component: OrganizationsPage,
});

function OrganizationsPage() {
  const user = useUser();
  console.log('User in OrganizationsPage:', user);
  const { data: organizations } = useSuspenseQuery(organizationsQueryOptions());
  const [organizationEditDialogOpen, setOrganizationEditDialogOpen] = useState(false);
  // const [organizationDeleteDialogOpen, setOrganizationDeleteDialogOpen] = useState(false);
  const [selectedOrganization, setSelectedOrganization] = useState<TAOrganization>();

  const handleRowEdit = (organization: TAOrganization) => {
    setSelectedOrganization(organization);
    setOrganizationEditDialogOpen(true);
  };

  const handleAddOrganization = () => {
    setSelectedOrganization(undefined);
    setOrganizationEditDialogOpen(true);
  };

  const organizationColumns: GridColDef[] = [
    { field: 'name', headerName: 'Name', width: 200 },
    {
      field: 'type',
      headerName: 'Type',
      width: 200,
      valueGetter: (value: TAOrganizationType) => value.name || '',
    },
    {
      field: 'transmission_planning_region',
      headerName: 'Transmission Planning Region',
      width: 200,
      valueGetter: (value: TransmissionPlanningRegion) => value.name || '',
    },
    {
      field: 'state',
      headerName: 'State',
      width: 200,
      valueGetter: (value: State) => value.name || '',
    },
    { field: 'address', headerName: 'Address', width: 200 },
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
              onClick={() => handleRowEdit(params.row as TAOrganization)}
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
            Organizations
          </Typography>
          <Stack justifyContent="center">
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddOrganization}>
              Add an organization
            </Button>
          </Stack>
        </Stack>
        <OrganizationsDataTable organizations={organizations} columns={organizationColumns} />
      </Stack>
      <OrganizationEditDialog
        open={organizationEditDialogOpen}
        onClose={() => setOrganizationEditDialogOpen(false)}
        organization={selectedOrganization}
      />
    </Container>
  );
}
