import { TAOrganization } from '@/api/dashboard/types';
import { Paper } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { OrganizationsToolbar } from './OrganizationsToolbar';

interface OrganizationsDataTableProps {
  organizations: TAOrganization[] | null;
  columns: GridColDef[];
  elevation?: number;
}

/**
 * Data table component for displaying organizations.
 * Used in the Experts page and also in the request details page (as ExpertsPanelDataTable).
 */
export const OrganizationsDataTable: React.FC<OrganizationsDataTableProps> = ({
  organizations,
  columns,
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
