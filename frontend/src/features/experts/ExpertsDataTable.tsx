import { CellWithPopover } from '@/components/CellWithPopover';
import { Chip, Paper, Stack, Tooltip } from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { TAExpert, TAExpertise } from '../../api/dashboard/types';
import { ExpertsToolbar } from './ExpertsToolbar';

interface ExpertsDataTableProps {
  experts: TAExpert[] | null;
  columns?: GridColDef[];
  elevation?: number;
}

export const expertColumns: GridColDef[] = [
  { field: 'name', headerName: 'Name', width: 150 },
  { field: 'email', headerName: 'Email', width: 150 },
  {
    field: 'lab',
    headerName: 'Lab',
    valueGetter: (value: any) => {
      return value?.name || '';
    },
  },
  {
    field: 'expertises',
    headerName: 'Expertise',
    flex: 1,
    // Convert array of expertise objects to a string to enable sorting/filtering by this field.
    // Each expertise is represented as "topic++depth", and multiple expertises are joined by "__"
    valueGetter: (value: any) => {
      return (
        value?.map((exp: TAExpertise) => `${exp.topic.name}++${exp.depth.name}`).join('__') || ''
      );
    },
    renderCell: (params: GridRenderCellParams<any, string>) => {
      const values = params.value?.split('__') || [];
      return (
        <CellWithPopover>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ height: '100%' }}>
            {values.map((expertiseStr: string) => (
              <Tooltip key={expertiseStr} title={expertiseStr.split('++')[1] || ''} placement="top">
                <Chip label={`${expertiseStr.split('++')[0]}`} variant="outlined" />
              </Tooltip>
            ))}
          </Stack>
        </CellWithPopover>
      );
    },
  },
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
 * Data table component for displaying experts.
 * Used in the Experts page and also in the request details page (as ExpertsPanelDataTable).
 */
export const ExpertsDataTable: React.FC<ExpertsDataTableProps> = ({
  experts,
  columns = expertColumns,
  elevation = 1,
}) => {
  return (
    <Paper elevation={elevation}>
      <DataGrid
        loading={experts === null}
        rows={experts || []}
        columns={columns}
        disableRowSelectionOnClick
        showToolbar
        slots={{ toolbar: ExpertsToolbar }}
        slotProps={{ toolbar: { experts: experts } }}
        sx={{ backgroundColor: 'white' }}
      />
    </Paper>
  );
};
