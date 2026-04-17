import { queryClient } from '@/App';
import { expertColumns, ExpertsDataTable } from '@/features/experts/ExpertsDataTable';
import { useIdentityContext } from '@/features/identity/IdentityContext';
import { useRequestsContext } from '@/features/requests/RequestsContext';
import { useToastContext } from '@/features/toasts/ToastContext';
import { ToastMessage } from '@/features/toasts/ToastMessage';
import { useAssignmentMutation } from '@/utils/queryOptions';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { Button, Stack } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import { GridColDef } from '@mui/x-data-grid';
import { useNavigate } from '@tanstack/react-router';
import { TAExpert } from '../../api/dashboard/types';

interface ExpertsPanelDataTableProps {
  experts: TAExpert[] | null;
  currentRequestId: number;
}

/**
 * A special instance of the ExpertsDataTable used in the request details page.
 * This component includes the "Assign" column which allows assigning the current
 * request to an expert directly from the table.
 */
export const ExpertsPanelDataTable: React.FC<ExpertsPanelDataTableProps> = ({
  experts,
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

  return <ExpertsDataTable experts={experts} columns={[...expertColumns, assignColumn]} />;
};
