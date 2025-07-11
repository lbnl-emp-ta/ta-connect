import {
  Button,
  Grid,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArticleIcon from '@mui/icons-material/Article';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import CancelIcon from '@mui/icons-material/Cancel';
import DateRangeIcon from '@mui/icons-material/DateRange';
import EastIcon from '@mui/icons-material/East';
import EditIcon from '@mui/icons-material/Edit';
import WestIcon from '@mui/icons-material/West';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { RequestInfoPanel } from '../../../../features/requests/RequestInfoPanel';
import { requestDetailQueryOptions, statusesQueryOptions } from '../../../../utils/queryOptions';
import { AppLink } from '../../../../components/AppLink';
import { useState } from 'react';
import { useRequestsContext } from '../../../../features/requests/RequestsContext';
import { useIdentityContext } from '../../../../features/identity/IdentityContext';
import { RequestCustomerPanel } from '../../../../features/requests/RequestCustomerPanel';
import { InfoPanel } from '../../../../components/InfoPanel';
import { TabPanel } from '../../../../components/TabPanel';

export const Route = createFileRoute('/_private/dashboard/requests/$requestId')({
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData(
      requestDetailQueryOptions(params.requestId, context.identity)
    );
    await context.queryClient.ensureQueryData(statusesQueryOptions(context.identity));
  },
  component: SelectedRequest,
});

function SelectedRequest() {
  const params = Route.useParams();
  const { identity } = useIdentityContext();
  const { data: selectedRequest } = useSuspenseQuery(
    requestDetailQueryOptions(params.requestId, identity)
  );
  console.log('Selected Request:', selectedRequest);
  const { sortedRequests } = useRequestsContext();
  const currentIndex = sortedRequests.findIndex((request) => {
    if (params?.requestId) {
      return request.id === parseInt(params.requestId);
    }
  });
  const nextIndex = currentIndex < sortedRequests.length - 1 ? currentIndex + 1 : null;
  const previousIndex = currentIndex > 0 ? currentIndex - 1 : null;
  const [actionsAnchorEl, setActionsAnchorEl] = useState<null | HTMLElement>(null);
  const actionsMenuOpen = Boolean(actionsAnchorEl);
  const [tabValue, setTabValue] = useState<string | number>('attachments');

  const handleClickActionsMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setActionsAnchorEl(event.currentTarget);
  };

  const handleCloseActionsMenu = () => {
    setActionsAnchorEl(null);
  };

  const handleChangeTab = (_event: React.SyntheticEvent, newValue: string | number) => {
    setTabValue(newValue);
  };

  return (
    <Stack>
      <Stack direction="row">
        {previousIndex !== null && (
          <AppLink
            to={'/dashboard/requests/$requestId'}
            params={{
              requestId: sortedRequests[previousIndex].id.toString(),
            }}
          >
            <Button variant="outlined" color="primary" startIcon={<WestIcon />}>
              Previous Request
            </Button>
          </AppLink>
        )}
        {previousIndex === null && (
          <span>
            <Button variant="outlined" color="primary" startIcon={<WestIcon />} disabled>
              Previous Request
            </Button>
          </span>
        )}
        {nextIndex !== null && (
          <AppLink
            to={'/dashboard/requests/$requestId'}
            params={{ requestId: sortedRequests[nextIndex].id.toString() }}
          >
            <Button variant="outlined" color="primary" startIcon={<EastIcon />}>
              Next Request
            </Button>
          </AppLink>
        )}
        {nextIndex === null && (
          <span>
            <Button variant="outlined" color="primary" startIcon={<EastIcon />} disabled>
              Next Request
            </Button>
          </span>
        )}
        <Typography
          variant="h4"
          color="primary"
          sx={{
            flex: 1,
            textAlign: 'center',
          }}
        >
          Request: {selectedRequest?.id}
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
      <Grid container spacing={2}>
        <Grid size={6} sx={{ minHeight: 550 }}>
          <RequestInfoPanel request={selectedRequest!} />
        </Grid>
        <Grid size={6}>
          <Stack>
            <RequestCustomerPanel customer={selectedRequest?.customers[0]} />
            <InfoPanel
              header={
                <Tabs
                  onChange={handleChangeTab}
                  value={tabValue}
                  textColor="inherit"
                  indicatorColor="primary"
                >
                  <Tab
                    label="Attachments"
                    value="attachments"
                    onClick={(event) => handleChangeTab(event, 'attachments')}
                  />
                  <Tab
                    label="Audit History"
                    value="audit-history"
                    onClick={(event) => handleChangeTab(event, 'audit-history')}
                  />
                </Tabs>
              }
            >
              <TabPanel value={tabValue} index="attachments">
                Attachments
              </TabPanel>
              <TabPanel value={tabValue} index="audit-history">
                Audit history
              </TabPanel>
            </InfoPanel>
          </Stack>
        </Grid>
      </Grid>
    </Stack>
  );
}
