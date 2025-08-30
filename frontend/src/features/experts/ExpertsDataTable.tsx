import { Chip, Paper, Stack, Tooltip } from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { TAExpert, TAExpertise } from '../../api/dashboard/types';
import { ExpertsToolbar } from './ExpertsToolbar';

interface ExpertsDataTableProps {
  experts: TAExpert[];
}

const columns: GridColDef[] = [
  { field: 'name', headerName: 'Name', width: 200 },
  { field: 'email', headerName: 'Email', width: 200 },
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
        <Stack direction="row" spacing={1} alignItems="center" sx={{ height: '100%' }}>
          {values.map((expertiseStr: string) => (
            <Tooltip key={expertiseStr} title={expertiseStr.split('++')[1] || ''} placement="top">
              <Chip label={`${expertiseStr.split('++')[0]}`} variant="outlined" />
            </Tooltip>
          ))}
        </Stack>
      );
    },
  },
  {
    field: 'requests',
    headerName: 'Assigned Requests',
    width: 200,
    type: 'number',
    valueGetter: (value: any) => {
      return value?.length || 0;
    },
  },
];

export const ExpertsDataTable: React.FC<ExpertsDataTableProps> = ({ experts }) => {
  return (
    <Paper>
      <DataGrid
        rows={experts || []}
        columns={columns}
        showToolbar
        slots={{ toolbar: ExpertsToolbar }}
        slotProps={{ toolbar: { experts: experts } }}
        sx={{ backgroundColor: 'white' }}
      />
    </Paper>
  );
};
