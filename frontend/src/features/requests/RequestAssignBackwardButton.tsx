import { TAOwner, TARequestDetail } from '@/api/dashboard/types';
import { ownersQueryOptions, useAssignmentMutation, useCancelMutation } from '@/api/queryOptions';
import { queryClient } from '@/App';
import { useAdminModeContext } from '@/features/admin-mode/AdminModeContext';
import { useRequestsContext } from '@/features/requests/RequestsContext';
import { useToastContext } from '@/features/toasts/ToastContext';
import { ToastMessage } from '@/features/toasts/ToastMessage';
import { getStep } from '@/utils/utils';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WestIcon from '@mui/icons-material/West';
import { Button, CircularProgress, Stack } from '@mui/material';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';

interface RequestAssignBackwardButtonProps {
  request: TARequestDetail;
}

/**
 * Dynamic button that sends a request backward in the workflow.
 * Depending on the current step of the request, this may involve reassigning the request to a previous owner
 * or canceling the request entirely.
 */
export const RequestAssignBackwardButton: React.FC<RequestAssignBackwardButtonProps> = ({
  request,
}) => {
  const navigate = useNavigate();
  const { isAdminMode } = useAdminModeContext();
  const { data: owners } = useSuspenseQuery(ownersQueryOptions(request.id.toString(), isAdminMode));
  const receptionOwnerId = owners?.find((owner) => owner.domain_type === 'reception')?.id;
  const { tab, nextId, previousId } = useRequestsContext();
  const { setShowToast, setToastMessage } = useToastContext();
  const currentStep = getStep(request);
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
  const assignRequestMutation = useAssignmentMutation(request.id.toString(), isAdminMode, {
    onMutate: onMutate('Assigning request'),
    onSuccess: onSuccess('Request assigned'),
    onError: onError,
  });
  const cancelRequestMutation = useCancelMutation(request.id.toString(), isAdminMode, {
    onMutate: onMutate('Canceling request'),
    onSuccess: onSuccess('Request canceled'),
    onError: onError,
  });

  const handleAssignment = (owner: TAOwner) => {
    assignRequestMutation.mutate({ owner: owner.id });
  };

  const handleBackward = (owner?: TAOwner) => {
    switch (request.status) {
      case 'scoping':
        cancelRequestMutation.mutate();
        break;
      case 'assigned-to-program':
      case 'rejected-by-lab':
        if (receptionOwnerId) {
          assignRequestMutation.mutate({ owner: receptionOwnerId });
        }
        break;
      case 'assigned-to-lab':
      case 'rejected-by-expert':
        if (request.program) {
          assignRequestMutation.mutate({ owner: request.program.owner_id });
        }
        break;
      case 'assigned-to-expert':
      case 'providing-ta':
        if (request.lab) {
          assignRequestMutation.mutate({ owner: request.lab.owner_id });
        }
        break;
      case 'closeout-started':
      case 'closeout-more-info':
        // TODO: Should just change status back to PROVIDING_TA
        if (request.lab) {
          assignRequestMutation.mutate({ owner: request.lab.owner_id });
        }
        break;
      case 'closeout-review-by-lab':
      case 'closeout-review-by-program':
        if (request.expert) {
          assignRequestMutation.mutate({ owner: request.expert.owner_id });
        }
        break;
      case 'completed':
      case 'unable-to-address':
        // reopen the request
        break;
      default:
        if (owner) handleAssignment(owner);
    }
  };

  if (
    !currentStep.backwardPermission ||
    !request.permissions.includes(currentStep.backwardPermission) ||
    currentStep.backwardPermission === 'cancel-request'
  ) {
    return null;
  }

  return (
    <Button
      variant="outlined"
      color="primary"
      startIcon={<WestIcon />}
      onClick={() => handleBackward()}
    >
      {currentStep.backwardText}
    </Button>
  );
};
