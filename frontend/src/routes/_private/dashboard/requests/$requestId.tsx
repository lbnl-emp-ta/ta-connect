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
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { AppLink } from '../../../../components/AppLink';
import { InfoPanel } from '../../../../components/InfoPanel';
import { TabPanel } from '../../../../components/TabPanel';
import { useIdentityContext } from '../../../../features/identity/IdentityContext';
import { RequestAssignButton } from '../../../../features/requests/RequestAssignButton';
import { RequestCustomerPanel } from '../../../../features/requests/RequestCustomerPanel';
import { RequestInfoPanel } from '../../../../features/requests/RequestInfoPanel';
import { useRequestsContext } from '../../../../features/requests/RequestsContext';
import {
  expertsQueryOptions,
  ownersQueryOptions,
  requestDetailQueryOptions,
  useCancelMutation,
  useFinishCloseoutMutation,
  useMarkCompleteMutation,
} from '../../../../utils/queryOptions';

export const Route = createFileRoute('/_private/dashboard/requests/$requestId')({
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData(
      requestDetailQueryOptions(params.requestId, context.identity)
    );
    await context.queryClient.ensureQueryData(ownersQueryOptions(context.identity));
    if (
      context.detailedIdentity?.role.name === 'Lab Lead' ||
      context.detailedIdentity?.role.name === 'Admin'
    ) {
      await context.queryClient.ensureQueryData(expertsQueryOptions(context.identity));
    }
  },
  component: SelectedRequest,
});

function SelectedRequest() {
  const params = Route.useParams();
  const { identity, detailedIdentity } = useIdentityContext();
  const { data: selectedRequest } = useSuspenseQuery(
    requestDetailQueryOptions(params.requestId, identity)
  );
  console.log('Selected Request:', selectedRequest);
  const { data: owners } = useSuspenseQuery(ownersQueryOptions(identity));
  const canAssignExperts =
    detailedIdentity?.role.name === 'Lab Lead' || detailedIdentity?.role.name === 'Admin';
  const { data: experts = [] } = useQuery({
    ...expertsQueryOptions(identity),
    enabled: canAssignExperts,
  });
  console.log('Experts:', experts);
  const completeRequestMutation = useMarkCompleteMutation(params.requestId, identity);
  const cancelRequestMutation = useCancelMutation(params.requestId, identity);
  const finishCloseoutMutation = useFinishCloseoutMutation(params.requestId, identity);
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

  const handleTabChange = (_event: React.SyntheticEvent, newValue: string | number) => {
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
        {selectedRequest && (
          <RequestAssignButton
            selectedRequest={selectedRequest}
            owners={owners}
            experts={experts}
          />
        )}
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
                  onChange={handleTabChange}
                  value={tabValue}
                  textColor="inherit"
                  indicatorColor="primary"
                >
                  <Tab
                    label="Attachments"
                    value="attachments"
                    onClick={(event) => handleTabChange(event, 'attachments')}
                  />
                  <Tab
                    label="Audit History"
                    value="audit-history"
                    onClick={(event) => handleTabChange(event, 'audit-history')}
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
