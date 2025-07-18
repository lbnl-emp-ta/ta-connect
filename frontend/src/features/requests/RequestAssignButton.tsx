import EastIcon from '@mui/icons-material/East';
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
import { useState } from 'react';
import { TAAssignment, TAExpert, TAOwner, TARequestDetail } from '../../api/dashboard/types';
import { useAssignmentMutation } from '../../utils/queryOptions';
import { useIdentityContext } from '../identity/IdentityContext';

interface RequestAssignButtonProps {
  selectedRequest: TARequestDetail;
  owners?: TAOwner[] | null;
  experts?: TAExpert[] | null;
}

export const RequestAssignButton: React.FC<RequestAssignButtonProps> = ({
  selectedRequest,
  owners,
  experts,
}) => {
  const { identity } = useIdentityContext();
  const assignRequestMutation = useAssignmentMutation(selectedRequest.id.toString(), identity);
  const [assignAnchorEl, setAssignAnchorEl] = useState<null | HTMLElement>(null);
  const assignMenuOpen = Boolean(assignAnchorEl);
  const handleAssignMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAssignAnchorEl(event.currentTarget);
  };

  const handleAssignMenuClose = () => {
    setAssignAnchorEl(null);
  };

  const handleAssignment = (entity: TAOwner | TAExpert) => {
    if (selectedRequest) {
      const mutationData: TAAssignment = { request: selectedRequest.id };
      if (entity.hasOwnProperty('domain_id')) {
        mutationData.owner = entity.id;
      } else if (entity.hasOwnProperty('expertise')) {
        mutationData.expert = entity.id;
      }
      assignRequestMutation.mutate(mutationData);
    }
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
