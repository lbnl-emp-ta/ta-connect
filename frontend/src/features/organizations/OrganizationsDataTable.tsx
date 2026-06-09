import { Paper } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { TAOrganization, TAOrganizationType } from '@/api/dashboard/types';
import { OrganizationsToolbar } from './OrganizationsToolbar';
import { State, TransmissionPlanningRegion } from '@/api/forms/types';

interface OrganizationsDataTableProps {
  organizations: TAOrganization[] | null;
  columns?: GridColDef[];
  elevation?: number;
}

export const organizationColumns: GridColDef[] = [
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
];

/**
 * Data table component for displaying organizations.
 * Used in the Experts page and also in the request details page (as ExpertsPanelDataTable).
 */
export const OrganizationsDataTable: React.FC<OrganizationsDataTableProps> = ({
  organizations,
  columns = organizationColumns,
  elevation = 1,
}) => {
  return (
    <Paper elevation={elevation}>
      <DataGrid
        loading={organizations === null}
        rows={organizations || []}
        columns={columns}
        disableRowSelectionOnClick
        showToolbar
        slots={{ toolbar: OrganizationsToolbar }}
        slotProps={{ toolbar: { organizations: organizations } }}
        sx={{ backgroundColor: 'white' }}
      />
    </Paper>
  );
};
