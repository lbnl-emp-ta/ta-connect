import { TAOwner, TARequestDetail } from '@/api/dashboard/types';
import { queryClient } from '@/App';
import { useIdentityContext } from '@/features/identity/IdentityContext';
import { useRequestsContext } from '@/features/requests/RequestsContext';
import { useToastContext } from '@/features/toasts/ToastContext';
import { ToastMessage } from '@/features/toasts/ToastMessage';
import { ownersQueryOptions, useAssignmentMutation, useCancelMutation } from '@/utils/queryOptions';
import { getStep, Steps } from '@/utils/utils';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WestIcon from '@mui/icons-material/West';
import ErrorIcon from '@mui/icons-material/Error';
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
  const { identity } = useIdentityContext();
  const { data: owners } = useSuspenseQuery(ownersQueryOptions(identity));
  const receptionOwnerId = owners?.find((owner) => owner.domain_type === 'reception')?.id;
  const { nextId, previousId } = useRequestsContext();
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
          to: `/dashboard/requests/$requestId`,
          params: { requestId: nextId.toString() },
        });
      } else if (previousId) {
        navigate({
          to: `/dashboard/requests/$requestId`,
          params: { requestId: previousId.toString() },
        });
      }
    };
  };
  const onError = (error: Error) => {
    setShowToast(true);
    setToastMessage(<ToastMessage icon={<ErrorIcon />}>{error.message}</ToastMessage>);
  };
  const assignRequestMutation = useAssignmentMutation(request.id.toString(), identity, {
    onMutate: onMutate('Assigning request'),
    onSuccess: onSuccess('Request assigned'),
    onError: onError,
  });
  const cancelRequestMutation = useCancelMutation(request.id.toString(), identity, {
    onMutate: onMutate('Canceling request'),
    onSuccess: onSuccess('Request canceled'),
    onError: onError,
  });

  const handleAssignment = (owner: TAOwner) => {
    assignRequestMutation.mutate({ request: request.id, owner: owner.id });
  };

  const handleBackward = (owner?: TAOwner) => {
    switch (currentStep.stepIndex) {
      case Steps.Reception:
        cancelRequestMutation.mutate();
        break;
      case Steps.Program:
        if (receptionOwnerId) {
          assignRequestMutation.mutate({ request: request.id, owner: receptionOwnerId });
        }
        break;
      case Steps.Lab:
        if (request.program) {
          assignRequestMutation.mutate({ request: request.id, owner: request.program.owner_id });
        }
        break;
      case Steps.Expert:
        if (request.lab) {
          assignRequestMutation.mutate({ request: request.id, owner: request.lab.owner_id });
        }
        break;
      case Steps.Approval:
        if (request.owner?.domain_type === 'lab' && request.expert) {
          assignRequestMutation.mutate({ request: request.id, owner: request.expert.owner_id });
        } else if (request.owner?.domain_type === 'program' && request.lab) {
          assignRequestMutation.mutate({ request: request.id, owner: request.lab.owner_id });
        }
        break;
      case Steps.Completed:
        // reopen the request
        break;
      default:
        if (owner) handleAssignment(owner);
    }
  };

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
