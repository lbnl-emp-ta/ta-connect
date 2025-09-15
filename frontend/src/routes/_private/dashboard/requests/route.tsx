import { createFileRoute, Outlet } from '@tanstack/react-router';
import SortIcon from '@mui/icons-material/Sort';
import {
  Badge,
  Box,
  Container,
  InputAdornment,
  MenuItem,
  Select,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { useRequestsContext } from '../../../../features/requests/RequestsContext';
import { requestsQueryOptions } from '../../../../utils/queryOptions';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useIdentityContext } from '../../../../features/identity/IdentityContext';
import { TabPanel } from '../../../../components/TabPanel';
import { a11yProps } from '../../../../utils/utils';
import { useEffect, useState } from 'react';
import { RequestsList } from '../../../../features/requests/RequestsList';

export const Route = createFileRoute('/_private/dashboard/requests')({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(requestsQueryOptions(context.identity));
  },
  component: RequestsPage,
});

function RequestsPage() {
  const { identity } = useIdentityContext();
  const { data: requests } = useSuspenseQuery(requestsQueryOptions(identity));
  const { sortField, setSortField } = useRequestsContext();
  const [tabValue, setTabValue] = useState<string | number>('actionable-requests');

  const handleChangeTab = (_event: React.SyntheticEvent, newValue: string | number) => {
    setTabValue(newValue);
  };

  useEffect(() => {
    setTabValue('actionable-requests');
  }, [identity]);

  return (
    <Stack direction="row" sx={{ height: '100%' }}>
      <Box
        sx={{
          flexBasis: 500,
          minWidth: 500,
        }}
      >
        {requests && (
          <>
            <Stack direction="row" sx={{ marginBottom: 2 }}>
              <Tabs
                value={tabValue}
                onChange={handleChangeTab}
                aria-label="requests tabs"
                sx={{
                  backgroundColor: 'grey.400',
                  borderRadius: 1,
                  display: 'inline-flex',
                  padding: 0.5,
                  '& .MuiButtonBase-root': {
                    borderRadius: 1,
                    textTransform: 'none',
                  },
                  '& .MuiTab-root.Mui-selected': {
                    backgroundColor: 'white',
                  },
                  '& .MuiTabs-indicator': {
                    height: 0,
                  },
                }}
              >
                <Tab
                  label={
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Typography>Actionable</Typography>
                      <Badge badgeContent={requests.actionable.length.toString()} color="primary" />
                    </Stack>
                  }
                  value="actionable-requests"
                  {...a11yProps('actionable-requests')}
                />
                <Tab
                  label={
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Typography>Downstream</Typography>
                      <Badge badgeContent={requests.downstream.length.toString()} color="primary" />
                    </Stack>
                  }
                  value="downstream-requests"
                  {...a11yProps('downstream-requests')}
                />
              </Tabs>
              <Select
                value={sortField}
                startAdornment={
                  <InputAdornment position="start">
                    <SortIcon />
                  </InputAdornment>
                }
                onChange={(e) => setSortField(e.target.value)}
              >
                <MenuItem value="-date_created">Newest first</MenuItem>
                <MenuItem value="date_created">Oldest first</MenuItem>
                <MenuItem value="status">Status</MenuItem>
              </Select>
            </Stack>
            <TabPanel value={tabValue} index="actionable-requests">
              <RequestsList requests={requests?.actionable} />
            </TabPanel>
            <TabPanel value={tabValue} index="downstream-requests">
              <RequestsList requests={requests?.downstream} />
            </TabPanel>
          </>
        )}
        {!requests && <Typography variant="body1">Failed to load requests.</Typography>}
      </Box>
      <Box sx={{ flexGrow: 1 }}>
        <Container maxWidth="xl">
          <Outlet />
        </Container>
      </Box>
    </Stack>
  );
}
