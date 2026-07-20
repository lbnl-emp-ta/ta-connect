import { TARequestDetail } from '@/api/dashboard/types';
import { useCancelMutation } from '@/api/queryOptions';
import { queryClient } from '@/App';
import { useAdminModeContext } from '@/features/admin-mode/AdminModeContext';
import { useRequestsContext } from '@/features/requests/RequestsContext';
import { useToastContext } from '@/features/toasts/ToastContext';
import { ToastMessage } from '@/features/toasts/ToastMessage';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { Button, CircularProgress, Stack } from '@mui/material';
import { useNavigate } from '@tanstack/react-router';

interface RequestCancelButtonProps {
  request: TARequestDetail;
}

/**
 * Button for canceling a request.
 * This component contains the logic to determine whether the current user
 * should see this button and be able to cancel the request.
 */
export const RequestCancelButton: React.FC<RequestCancelButtonProps> = ({ request }) => {
  const navigate = useNavigate();
  const { isAdminMode } = useAdminModeContext();
  const { tab, nextId, previousId } = useRequestsContext();
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
  const cancelRequestMutation = useCancelMutation(request.id.toString(), isAdminMode, {
    onMutate: onMutate('Canceling request'),
    onSuccess: onSuccess('Request canceled'),
    onError: onError,
  });

  const handleCancel = () => {
    cancelRequestMutation.mutate();
  };

  if (!request.permissions.includes('cancel-request')) {
    return null;
  }

  return (
    <Button
      variant="contained"
      color="error"
      startIcon={<CancelIcon />}
      onClick={() => handleCancel()}
    >
      Cancel request
    </Button>
  );
};
