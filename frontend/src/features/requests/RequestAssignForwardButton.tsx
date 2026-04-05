import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EastIcon from '@mui/icons-material/East';
import ErrorIcon from '@mui/icons-material/Error';
import {
  Box,
  Button,
  capitalize,
  Chip,
  CircularProgress,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { TAOwner, TARequestDetail } from '@/api/dashboard/types';
import { queryClient } from '@/App';
import {
  ownersQueryOptions,
  useAssignmentMutation,
  useFinishCloseoutMutation,
  useMarkCompleteMutation,
  useReopenMutation,
} from '@/utils/queryOptions';
import { useIdentityContext } from '@/features/identity/IdentityContext';
import { useToastContext } from '@/features/toasts/ToastContext';
import { ToastMessage } from '@/features/toasts/ToastMessage';
import { useRequestsContext } from '@/features/requests/RequestsContext';
import { AppLink } from '@/components/AppLink';
import { getStep, Steps } from '@/utils/utils';

interface RequestAssignForwardButtonProps {
  request: TARequestDetail;
}

/**
 * Dynamic button that either shows a menu of owners to assign the request to,
 * or performs a forward action such as marking the request complete or finishing closeout,
 * depending on the current step of the request.
 */
export const RequestAssignForwardButton: React.FC<RequestAssignForwardButtonProps> = ({
  request,
}) => {
  const navigate = useNavigate();
  const { identity, detailedIdentity } = useIdentityContext();
  const { data: owners } = useSuspenseQuery(ownersQueryOptions(identity));
  const { tab, nextId, previousId } = useRequestsContext();
  const { setShowToast, setToastMessage } = useToastContext();
  const [searchTerm, setSearchTerm] = useState('');
  const ownersContainsExperts = owners?.some((owner) => owner.domain_type === 'expert');
  const currentStep = useMemo(() => {
    return getStep(request);
  }, [request]);
  const forwardOwners = useMemo(() => {
    switch (currentStep.stepIndex) {
      case Steps.Reception:
        return owners?.filter((owner) => owner.domain_type === 'program');
      case Steps.Program:
        return owners?.filter((owner) => owner.domain_type === 'lab');
      case Steps.Lab:
        return owners?.filter((owner) => owner.domain_type === 'expert');
      default:
        return [];
    }
  }, [owners, currentStep]);
  const filteredOwners = useMemo(() => {
    if (!searchTerm) return forwardOwners ?? [];
    const lowerSearch = searchTerm.toLowerCase();
    return (forwardOwners ?? []).filter((owner) => {
      const includesName = owner?.domain_name?.toLowerCase().includes(lowerSearch);
      const includesDescription = owner?.domain_description?.toLowerCase().includes(lowerSearch);
      return includesName || includesDescription;
    });
  }, [forwardOwners, searchTerm]);
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
  const assignRequestMutation = useAssignmentMutation(request.id.toString(), identity, {
    onMutate: onMutate('Assigning request'),
    onSuccess: onSuccess('Request assigned'),
    onError: onError,
  });
  const finishCloseoutMutation = useFinishCloseoutMutation(request.id.toString(), identity, {
    onMutate: onMutate('Finishing request closeout'),
    onSuccess: onSuccess('Request closeout finished'),
    onError: onError,
  });
  const completeRequestMutation = useMarkCompleteMutation(request.id.toString(), identity, {
    onMutate: onMutate('Marking request as complete'),
    onSuccess: onSuccess('Request marked as complete'),
    onError: onError,
  });
  const reopenRequestMutation = useReopenMutation(request.id.toString(), identity, {
    onMutate: onMutate('Reopening request'),
    onSuccess: onSuccess('Request reopened and assigned to Reception'),
    onError: onError,
  });
  const [assignAnchorEl, setAssignAnchorEl] = useState<null | HTMLElement>(null);
  const assignMenuOpen = Boolean(assignAnchorEl);
  const handleAssignMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAssignAnchorEl(event.currentTarget);
  };

  const handleAssignMenuClose = () => {
    setAssignAnchorEl(null);
    setSearchTerm('');
  };

  const handleAssignment = (owner: TAOwner) => {
    assignRequestMutation.mutate({ request: request.id, owner: owner.id });
    handleAssignMenuClose();
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleForward = (owner?: TAOwner) => {
    switch (currentStep.stepIndex) {
      case Steps.Expert:
        finishCloseoutMutation.mutate();
        break;
      case Steps.Approval:
        if (request.owner?.domain_type === 'lab' && request.program) {
          assignRequestMutation.mutate({ request: request.id, owner: request.program.owner_id });
        } else if (request.owner?.domain_type === 'program') {
          completeRequestMutation.mutate();
        }
        break;
      case Steps.Completed:
        reopenRequestMutation.mutate();
        break;
      default:
        if (owner) handleAssignment(owner);
    }
  };

  if (!detailedIdentity || !currentStep.allowedRoles.includes(detailedIdentity.role.name)) {
    return null;
  }

  if (!currentStep.forwardIsMenu) {
    return (
      <Button
        variant="contained"
        color="primary"
        endIcon={<EastIcon />}
        onClick={() => handleForward()}
      >
        {currentStep.forwardText}
      </Button>
    );
  }

  return (
    <>
      <Button
        id="assign-menu-button"
        aria-controls={assignMenuOpen ? 'assign-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={assignMenuOpen ? 'true' : undefined}
        variant="contained"
        color="primary"
        endIcon={<EastIcon />}
        onClick={handleAssignMenuClick}
      >
        {currentStep.forwardText}
      </Button>
      <Menu
        id="assign-menu"
        anchorEl={assignAnchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={assignMenuOpen}
        onClose={handleAssignMenuClose}
        aria-labelledby="assign-menu-button"
      >
        <Box sx={{ padding: 1 }}>
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search assignees"
            fullWidth
            value={searchTerm}
            onChange={handleSearch}
            onKeyDown={(e) => e.stopPropagation()}
          />
        </Box>
        {ownersContainsExperts && (
          <AppLink to="/experts">
            <MenuItem>
              <ListItemText sx={{ color: 'secondary.main' }}>
                <Typography variant="body2" component="div">
                  <Stack direction="row" alignItems="center">
                    <span>Explore experts</span>
                    <EastIcon />
                  </Stack>
                </Typography>
              </ListItemText>
            </MenuItem>
          </AppLink>
        )}
        {filteredOwners?.map((owner) => (
          <MenuItem key={owner.id} onClick={() => handleForward(owner)}>
            <Stack direction="row" spacing={1}>
              <ListItemText>{owner.domain_name}</ListItemText>
              <Chip label={capitalize(owner.domain_type)} size="small" />
            </Stack>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};
