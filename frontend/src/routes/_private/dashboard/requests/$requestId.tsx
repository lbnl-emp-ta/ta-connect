import EastIcon from '@mui/icons-material/East';
import WestIcon from '@mui/icons-material/West';
import { Badge, Button, Grid, Paper, Stack, Tab, Tabs, Typography } from '@mui/material';
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
  notesQueryOptions,
  ownersQueryOptions,
  requestDetailQueryOptions,
  topicsQueryOptions,
} from '../../../../utils/queryOptions';
import { RequestAttachments } from '../../../../features/requests/RequestAttachments';
import { RequestNotes } from '../../../../features/requests/RequestNotes';

export const Route = createFileRoute('/_private/dashboard/requests/$requestId')({
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData(
      requestDetailQueryOptions(params.requestId, context.identity)
    );
    await context.queryClient.ensureQueryData(ownersQueryOptions(context.identity));
    await context.queryClient.ensureQueryData(topicsQueryOptions());
    await context.queryClient.ensureQueryData(
      notesQueryOptions(params.requestId, context.identity)
    );
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
  const { data: selectedRequestNotes } = useSuspenseQuery(
    notesQueryOptions(params.requestId, identity)
  );
  const { data: owners } = useSuspenseQuery(ownersQueryOptions(identity));
  const canAssignExperts =
    detailedIdentity?.role.name === 'Lab Lead' || detailedIdentity?.role.name === 'Admin';
  const { data: experts = [] } = useQuery({
    ...expertsQueryOptions(identity),
    enabled: canAssignExperts,
  });
  const { sortedRequests, setCurrentIndex, nextId, previousId } = useRequestsContext();
  const currentIndex = sortedRequests.findIndex((request) => {
    if (params?.requestId) {
      return request.id === parseInt(params.requestId);
    }
  });
  setCurrentIndex(currentIndex);
  const [tabValue, setTabValue] = useState<string | number>('notes');

  const handleTabChange = (_event: React.SyntheticEvent, newValue: string | number) => {
    setTabValue(newValue);
  };

  if (!selectedRequest) {
    return <Typography variant="h6">Loading request details...</Typography>;
  }

  return (
    <Paper sx={{ padding: 2 }}>
      <Stack direction="row" sx={{ marginBottom: 2 }}>
        {previousId !== null && (
          <AppLink
            to={'/dashboard/requests/$requestId'}
            params={{
              requestId: previousId.toString(),
            }}
          >
            <Button variant="outlined" color="primary" startIcon={<WestIcon />}>
              Previous Request
            </Button>
          </AppLink>
        )}
        {previousId === null && (
          <span>
            <Button variant="outlined" color="primary" startIcon={<WestIcon />} disabled>
              Previous Request
            </Button>
          </span>
        )}
        {nextId !== null && (
          <AppLink to={'/dashboard/requests/$requestId'} params={{ requestId: nextId.toString() }}>
            <Button variant="outlined" color="primary" startIcon={<EastIcon />}>
              Next Request
            </Button>
          </AppLink>
        )}
        {nextId === null && (
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
                    label={
                      <Stack direction="row" spacing={2} alignItems="center">
                        <span>Notes</span>
                        {selectedRequestNotes?.length ? (
                          <Badge badgeContent={selectedRequestNotes.length} color="primary" />
                        ) : null}
                      </Stack>
                    }
                    value="notes"
                    onClick={(event) => handleTabChange(event, 'notes')}
                  />
                  <Tab
                    label={
                      <Stack direction="row" spacing={2} alignItems="center">
                        <span>Attachments</span>
                        {selectedRequest.attachments?.length ? (
                          <Badge
                            badgeContent={selectedRequest.attachments.length}
                            color="primary"
                          />
                        ) : null}
                      </Stack>
                    }
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
              <TabPanel value={tabValue} index="notes">
                <RequestNotes requestId={selectedRequest.id} notes={selectedRequestNotes} />
              </TabPanel>
              <TabPanel value={tabValue} index="attachments">
                <RequestAttachments
                  requestId={selectedRequest.id}
                  attachments={selectedRequest.attachments}
                />
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
