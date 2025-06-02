import { createFileRoute, Outlet } from '@tanstack/react-router';
// import { KeyboardArrowDown, KeyboardArrowUp} from '@mui/icons-material'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArticleIcon from '@mui/icons-material/Article';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import CancelIcon from '@mui/icons-material/Cancel';
import DateRangeIcon from '@mui/icons-material/DateRange';
import EastIcon from '@mui/icons-material/East';
import EditIcon from '@mui/icons-material/Edit';
import WestIcon from '@mui/icons-material/West';
import {
  Button,
  Container,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { RequestTable } from '../../../../features/requests/RequestsTable';
import { customerRequestRelationshipOptions } from '../../../../utils/queryOptions';

export const Route = createFileRoute('/_private/dashboard/requests')({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(
      customerRequestRelationshipOptions()
    );
  },
  component: RequestsPage,
});

function RequestsPage() {
  const [actionsAnchorEl, setActionsAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const actionsMenuOpen = Boolean(actionsAnchorEl);

  const handleClickActionsMenu = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    setActionsAnchorEl(event.currentTarget);
  };

  const handleCloseActionsMenu = () => {
    setActionsAnchorEl(null);
  };
  return (
    <Container maxWidth="xl">
      <Stack>
        <Typography variant="h5" component="h1">
          Dashboard / Requests
        </Typography>
        <Stack direction="row">
          <Button variant="outlined" color="primary" startIcon={<WestIcon />}>
            Show Previous
          </Button>
          <Button variant="outlined" color="primary" endIcon={<EastIcon />}>
            Show Next
          </Button>
          <Typography
            variant="h4"
            color="primary"
            sx={{
              flex: 1,
            }}
          >
            View: Request #?
          </Typography>
          <Button
            id="actions-menu-button"
            aria-controls={actionsMenuOpen ? 'actions-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={actionsMenuOpen ? 'true' : undefined}
            variant="outlined"
            color="primary"
            endIcon={<ArrowDropDownIcon />}
            onClick={handleClickActionsMenu}
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
            onClose={handleCloseActionsMenu}
            aria-labelledby="actions-menu-button"
          >
            <MenuItem onClick={handleCloseActionsMenu}>
              <ListItemIcon>
                <EditIcon />
              </ListItemIcon>
              <ListItemText>Edit</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleCloseActionsMenu}>
              <ListItemIcon>
                <DateRangeIcon />
              </ListItemIcon>
              <ListItemText>Set Dates</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleCloseActionsMenu}>
              <ListItemIcon>
                <ArticleIcon />
              </ListItemIcon>
              <ListItemText>Finish Closout</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleCloseActionsMenu}>
              <ListItemIcon>
                <AssignmentTurnedInIcon />
              </ListItemIcon>
              <ListItemText>Mark Complete</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleCloseActionsMenu}>
              <ListItemIcon>
                <CancelIcon />
              </ListItemIcon>
              <ListItemText>Cancel Request</ListItemText>
            </MenuItem>
          </Menu>
          <Button variant="contained" color="primary" endIcon={<EastIcon />}>
            Assign
          </Button>
        </Stack>
        <Outlet />
        <RequestTable />
      </Stack>
    </Container>
  );
}
