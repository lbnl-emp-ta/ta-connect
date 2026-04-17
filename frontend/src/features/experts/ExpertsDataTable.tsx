import { CellWithPopover } from '@/components/CellWithPopover';
import { Button, Chip, Paper, Stack, Tooltip } from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CircularProgress from '@mui/material/CircularProgress';
import ErrorIcon from '@mui/icons-material/Error';
import { useNavigate } from '@tanstack/react-router';
import { TAExpert, TAExpertise, TAOwner } from '../../api/dashboard/types';
import { ExpertsToolbar } from './ExpertsToolbar';
import { queryClient } from '@/App';
import { useIdentityContext } from '@/features/identity/IdentityContext';
import { useRequestsContext } from '@/features/requests/RequestsContext';
import { useToastContext } from '@/features/toasts/ToastContext';
import { ToastMessage } from '@/features/toasts/ToastMessage';
import { useAssignmentMutation } from '@/utils/queryOptions';

interface ExpertsDataTableProps {
  experts: TAExpert[] | null;
  showAssignColumn?: boolean;
  currentRequestId?: number;
}

const columns: GridColDef[] = [
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

export const ExpertsDataTable: React.FC<ExpertsDataTableProps> = ({
  experts,
  showAssignColumn,
  currentRequestId,
}) => {
  const navigate = useNavigate();
  const { identity } = useIdentityContext();
  const { tab, nextId, previousId, setExpertsPanelOpen } = useRequestsContext();
  const { setShowToast, setToastMessage } = useToastContext();
  const onMutate = (message: string) => {
    return () => {
      setShowToast(true);
      setToastMessage(
        <ToastMessage>
          <Stack direction="row" alignItems="center">
            <CircularProgress size="1.25rem" color="info" />
            <span>{message}</span>
          </Stack>
        </ToastMessage>
      );
    };
  };
  const onSuccess = (message: string) => {
    return () => {
      queryClient.invalidateQueries();
      setShowToast(true);
      setToastMessage(<ToastMessage icon={<CheckCircleIcon />}>{message}</ToastMessage>);
      if (nextId) {
        navigate({
          to: `/requests/${tab}/${nextId}`,
          params: { requestId: nextId.toString() },
        });
      } else if (previousId) {
        navigate({
          to: `/requests/${tab}/${previousId}`,
          params: { requestId: previousId.toString() },
        });
      }
    };
  };
  const onError = (error: Error) => {
    setShowToast(true);
    setToastMessage(<ToastMessage icon={<ErrorIcon />}>{error.message}</ToastMessage>);
  };
  const assignRequestMutation = currentRequestId
    ? useAssignmentMutation(currentRequestId.toString(), identity, {
        onMutate: onMutate('Assigning request'),
        onSuccess: onSuccess('Request assigned'),
        onError: onError,
      })
    : null;

  const handleAssignment = (expert: TAExpert) => {
    if (!assignRequestMutation || !currentRequestId) return;
    assignRequestMutation.mutate({ request: currentRequestId, owner: expert.owner_id });
    setExpertsPanelOpen(false);
  };

  const assignColumn: GridColDef = {
    field: 'assign',
    headerName: 'Assign',
    width: 150,
    type: 'custom',
    align: 'center',
    headerAlign: 'center',
    renderCell: (params) => (
      <Button
        variant="contained"
        color="primary"
        size="small"
        onClick={() => handleAssignment(params.row)}
      >
        Assign
      </Button>
    ),
  };

  return (
    <Paper>
      <DataGrid
        loading={experts === null}
        rows={experts || []}
        columns={showAssignColumn ? [...columns, assignColumn] : columns}
        disableRowSelectionOnClick
        showToolbar
        slots={{ toolbar: ExpertsToolbar }}
        slotProps={{ toolbar: { experts: experts } }}
        sx={{ backgroundColor: 'white' }}
      />
    </Paper>
  );
};
