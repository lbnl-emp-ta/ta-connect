import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EastIcon from '@mui/icons-material/East';
import ErrorIcon from '@mui/icons-material/Error';
import {
  Box,
  Button,
  capitalize,
  Chip,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  TextField,
} from '@mui/material';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { TAAssignment, TAExpert, TAOwner, TARequestDetail } from '../../api/dashboard/types';
import { queryClient } from '../../App';
import { useAssignmentMutation } from '../../utils/queryOptions';
import { useIdentityContext } from '../identity/IdentityContext';
import { useToastContext } from '../toasts/ToastContext';
import { ToastMessage } from '../toasts/ToastMessage';
import { useRequestsContext } from './RequestsContext';

interface RequestAssignButtonProps {
  requestId: TARequestDetail['id'];
  owners?: TAOwner[] | null;
  experts?: TAExpert[] | null;
}

export const RequestAssignButton: React.FC<RequestAssignButtonProps> = ({
  requestId,
  owners,
  experts,
}) => {
  const navigate = useNavigate();
  const { identity } = useIdentityContext();
  const { nextId, previousId } = useRequestsContext();
  const { setShowToast, setToastMessage } = useToastContext();
  const assignRequestMutation = useAssignmentMutation(requestId.toString(), identity, {
    onSuccess: () => {
      queryClient.invalidateQueries();
      setShowToast(true);
      setToastMessage(
        <ToastMessage icon={<CheckCircleIcon />}>Request assignment saved</ToastMessage>
      );
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
    },
    onError: (error: Error) => {
      setShowToast(true);
      setToastMessage(<ToastMessage icon={<ErrorIcon />}>{error.message}</ToastMessage>);
    },
  });
  const [assignAnchorEl, setAssignAnchorEl] = useState<null | HTMLElement>(null);
  const assignMenuOpen = Boolean(assignAnchorEl);
  const handleAssignMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAssignAnchorEl(event.currentTarget);
  };

  const handleAssignMenuClose = () => {
    setAssignAnchorEl(null);
  };

  const handleAssignment = (entity: TAOwner | TAExpert) => {
    const mutationData: TAAssignment = { request: requestId };
    if (Object.prototype.hasOwnProperty.call(entity, 'domain_id')) {
      mutationData.owner = entity.id;
    } else if (Object.prototype.hasOwnProperty.call(entity, 'expertise')) {
      mutationData.expert = entity.id;
    }
    assignRequestMutation.mutate(mutationData);
  };

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
        Assign
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
          <TextField variant="outlined" size="small" placeholder="Search Owners" fullWidth />
        </Box>
        {owners?.map((owner) => (
          <MenuItem key={owner.id} onClick={() => handleAssignment(owner)}>
            <Stack direction="row" spacing={1}>
              <ListItemText>{owner.domain_name}</ListItemText>
              <Chip label={capitalize(owner.domain_type)} size="small" />
            </Stack>
          </MenuItem>
        ))}
        {experts?.map((expert) => (
          <MenuItem key={expert.id} onClick={() => handleAssignment(expert)}>
            <Stack direction="row" spacing={1}>
              <ListItemText>{expert.name}</ListItemText>
              <Chip label="Expert" size="small" />
            </Stack>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};
