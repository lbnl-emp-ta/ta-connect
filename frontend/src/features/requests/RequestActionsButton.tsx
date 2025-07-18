import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArticleIcon from '@mui/icons-material/Article';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import CancelIcon from '@mui/icons-material/Cancel';
import EditIcon from '@mui/icons-material/Edit';
import DateRangeIcon from '@mui/icons-material/DateRange';
import { Button, ListItemIcon, ListItemText, Menu, MenuItem } from '@mui/material';
import { useState } from 'react';
import { TARequestDetail } from '../../api/dashboard/types';
import {
  useCancelMutation,
  useFinishCloseoutMutation,
  useMarkCompleteMutation,
} from '../../utils/queryOptions';
import { useIdentityContext } from '../identity/IdentityContext';

interface RequestActionsButtonProps {
  requestId: TARequestDetail['id'];
}

export const RequestActionsButton: React.FC<RequestActionsButtonProps> = ({ requestId }) => {
  const { identity } = useIdentityContext();
  const completeRequestMutation = useMarkCompleteMutation(requestId.toString(), identity);
  const cancelRequestMutation = useCancelMutation(requestId.toString(), identity);
  const finishCloseoutMutation = useFinishCloseoutMutation(requestId.toString(), identity);
  const [actionsAnchorEl, setActionsAnchorEl] = useState<null | HTMLElement>(null);
  const actionsMenuOpen = Boolean(actionsAnchorEl);

  const handleActionsMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setActionsAnchorEl(event.currentTarget);
  };

  const handleActionsMenuClose = () => {
    setActionsAnchorEl(null);
  };

  const handleMarkComplete = () => {
    completeRequestMutation.mutate();
    setActionsAnchorEl(null);
  };

  const handleCancelRequest = () => {
    cancelRequestMutation.mutate();
    setActionsAnchorEl(null);
  };

  const handleFinishCloseout = () => {
    finishCloseoutMutation.mutate();
    setActionsAnchorEl(null);
  };
  return (
    <>
      <Button
        id="actions-menu-button"
        aria-controls={actionsMenuOpen ? 'actions-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={actionsMenuOpen ? 'true' : undefined}
        variant="outlined"
        color="primary"
        endIcon={<ArrowDropDownIcon />}
        onClick={handleActionsMenuClick}
      >
        More Actions
      </Button>
      <Menu
        id="actions-menu"
        anchorEl={actionsAnchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={actionsMenuOpen}
        onClose={handleActionsMenuClose}
        aria-labelledby="actions-menu-button"
      >
        <MenuItem onClick={handleActionsMenuClose}>
          <ListItemIcon>
            <EditIcon />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleActionsMenuClose}>
          <ListItemIcon>
            <DateRangeIcon />
          </ListItemIcon>
          <ListItemText>Set Dates</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleFinishCloseout}>
          <ListItemIcon>
            <ArticleIcon />
          </ListItemIcon>
          <ListItemText>Finish Closout</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMarkComplete}>
          <ListItemIcon>
            <AssignmentTurnedInIcon />
          </ListItemIcon>
          <ListItemText>Mark Complete</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleCancelRequest}>
          <ListItemIcon>
            <CancelIcon />
          </ListItemIcon>
          <ListItemText>Cancel Request</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};
