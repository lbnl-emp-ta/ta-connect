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
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { TAOwner, TARequestDetail } from '../../api/dashboard/types';
import { queryClient } from '../../App';
import { useAssignmentMutation } from '../../utils/queryOptions';
import { useIdentityContext } from '../identity/IdentityContext';
import { useToastContext } from '../toasts/ToastContext';
import { ToastMessage } from '../toasts/ToastMessage';
import { useRequestsContext } from './RequestsContext';
import { AppLink } from '../../components/AppLink';

interface RequestAssignButtonProps {
  requestId: TARequestDetail['id'];
  owners?: TAOwner[] | null;
}

export const RequestAssignButton: React.FC<RequestAssignButtonProps> = ({ requestId, owners }) => {
  const navigate = useNavigate();
  const { identity } = useIdentityContext();
  const { nextId, previousId } = useRequestsContext();
  const { setShowToast, setToastMessage } = useToastContext();
  const [filteredOwners, setFilteredOwners] = useState(owners);
  const [searchTerm, setSearchTerm] = useState('');
  const assignRequestMutation = useAssignmentMutation(requestId.toString(), identity, {
    onMutate: () => {
      setShowToast(true);
      setToastMessage(
        <ToastMessage>
          <Stack direction="row" alignItems="center">
            <CircularProgress size="1.25rem" color="info" />
            <span>Assigning request</span>
          </Stack>
        </ToastMessage>
      );
    },
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
    setSearchTerm('');
  };

  const handleAssignment = (owner: TAOwner) => {
    assignRequestMutation.mutate({ request: requestId, owner: owner.id });
    handleAssignMenuClose();
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = event.target.value.toLowerCase();
    const newFilteredOwners = owners?.filter((owner) => {
      const includesName = owner?.domain_name?.toLowerCase().includes(newSearchTerm);
      const includesDescription = owner?.domain_description?.toLowerCase().includes(newSearchTerm);
      return includesName || includesDescription;
    });
    setSearchTerm(event.target.value);
    setFilteredOwners(newFilteredOwners);
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
        <AppLink to="/dashboard/experts">
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
        {filteredOwners?.map((owner) => (
          <MenuItem key={owner.id} onClick={() => handleAssignment(owner)}>
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
