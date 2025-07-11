import { createFileRoute, Outlet } from '@tanstack/react-router';
import { Badge, Box, Container, Stack, Tab, Tabs, Typography } from '@mui/material';
import { RequestsProvider } from '../../../../features/requests/RequestsContext';
import { RequestsTable } from '../../../../features/requests/RequestsTable';
import { requestsQueryOptions } from '../../../../utils/queryOptions';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useIdentityContext } from '../../../../features/identity/IdentityContext';
import { TabPanel } from '../../../../components/TabPanel';
import { a11yProps } from '../../../../utils/utils';
import { useState } from 'react';

export const Route = createFileRoute('/_private/dashboard/requests')({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(requestsQueryOptions(context.identity));
  },
  component: RequestsPage,
});

function RequestsPage() {
  const { identity } = useIdentityContext();

  const { data: requests } = useSuspenseQuery(requestsQueryOptions(identity));
  const [tabValue, setTabValue] = useState<string | number>('actionable-requests');

  const handleChangeTab = (_event: React.SyntheticEvent, newValue: string | number) => {
    setTabValue(newValue);
  };

  return (
    <RequestsProvider>
      <Container maxWidth="xl">
        <Stack>
          <Typography variant="h5" component="h1">
            Requests
          </Typography>
          <Outlet />
          {requests && (
            <Box>
              <Tabs value={tabValue} onChange={handleChangeTab} aria-label="requests tabs">
                <Tab
                  label={
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Typography>Actionable Requests</Typography>
                      <Badge badgeContent={requests.actionable.length.toString()} color="primary" />
                    </Stack>
                  }
                  value="actionable-requests"
                  {...a11yProps('actionable-requests')}
                />
                <Tab
                  label={
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Typography>Downstream Requests</Typography>
                      <Badge badgeContent={requests.downstream.length.toString()} color="primary" />
                    </Stack>
                  }
                  value="downstream-requests"
                  {...a11yProps('downstream-requests')}
                />
              </Tabs>
              <TabPanel value={tabValue} index="actionable-requests">
                <RequestsTable data={requests?.actionable} />
              </TabPanel>
              <TabPanel value={tabValue} index="downstream-requests">
                <RequestsTable data={requests?.downstream} />
              </TabPanel>
            </Box>
          )}
          {!requests && (
            <Box>
              <Typography variant="body1">Failed to load requests.</Typography>
            </Box>
          )}
        </Stack>
      </Container>
    </RequestsProvider>
  );
}
