import EastIcon from '@mui/icons-material/East';
import WestIcon from '@mui/icons-material/West';
import { Button, Grid, Paper, Stack, Tab, Tabs, Typography } from '@mui/material';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { AppLink } from '../../../../components/AppLink';
import { InfoPanel } from '../../../../components/InfoPanel';
import { TabPanel } from '../../../../components/TabPanel';
import { useIdentityContext } from '../../../../features/identity/IdentityContext';
import { RequestActionsButton } from '../../../../features/requests/RequestActionsButton';
import { RequestAssignButton } from '../../../../features/requests/RequestAssignButton';
import { RequestCustomerPanel } from '../../../../features/requests/RequestCustomerPanel';
import { RequestInfoPanel } from '../../../../features/requests/RequestInfoPanel';
import { useRequestsContext } from '../../../../features/requests/RequestsContext';
import {
  expertsQueryOptions,
  ownersQueryOptions,
  requestDetailQueryOptions,
  topicsQueryOptions,
} from '../../../../utils/queryOptions';

export const Route = createFileRoute('/_private/dashboard/requests/$requestId')({
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData(
      requestDetailQueryOptions(params.requestId, context.identity)
    );
    await context.queryClient.ensureQueryData(ownersQueryOptions(context.identity));
    await context.queryClient.ensureQueryData(topicsQueryOptions());
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

  const { sortedRequests } = useRequestsContext();
  const currentIndex = sortedRequests.findIndex((request) => {
    if (params?.requestId) {
      return request.id === parseInt(params.requestId);
    }
  });
  const nextIndex = currentIndex < sortedRequests.length - 1 ? currentIndex + 1 : null;
  const previousIndex = currentIndex > 0 ? currentIndex - 1 : null;
  const [tabValue, setTabValue] = useState<string | number>('attachments');

  const handleTabChange = (_event: React.SyntheticEvent, newValue: string | number) => {
    setTabValue(newValue);
  };

  return (
    <Paper sx={{ padding: 2 }}>
      <Stack direction="row" sx={{ marginBottom: 2 }}>
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
          variant="h6"
          component="h1"
          color="primary"
          sx={{
            flex: 1,
            fontWeight: 'bold',
            textAlign: 'center',
          }}
        >
          Request #{selectedRequest?.id}
        </Typography>
        {selectedRequest && (
          <>
            <RequestActionsButton requestId={selectedRequest.id} />
            <RequestAssignButton requestId={selectedRequest.id} owners={owners} experts={experts} />
          </>
        )}
      </Stack>
      <Grid container spacing={1}>
        <Grid size={6}>
          <RequestInfoPanel request={selectedRequest!} />
        </Grid>
        <Grid size={6}>
          <Stack>
            <RequestCustomerPanel customer={selectedRequest?.customers[0]} />
            <InfoPanel
              tabs={
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
    </Paper>
  );
}
