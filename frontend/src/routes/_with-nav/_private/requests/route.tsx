import { AppLink } from '@/components/AppLink';
import { identitiesQueryOptions } from '@/utils/queryOptions';
import { a11yProps } from '@/utils/utils';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PeopleIcon from '@mui/icons-material/People';
import { Box, Stack, Tab, Tabs, Typography } from '@mui/material';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, Navigate, Outlet, redirect, useLocation } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

export const Route = createFileRoute('/_with-nav/_private/requests')({
  beforeLoad({ location }) {
    if (location.pathname === '/requests' || location.pathname === '/requests/') {
      throw redirect({ to: '/requests/active' });
    }
  },
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(identitiesQueryOptions());
  },
  component: DashboardComponent,
});

function DashboardComponent() {
  const location = useLocation();
  const { data: identities } = useSuspenseQuery(identitiesQueryOptions());
  const [tabValue, setTabValue] = useState<string | number>(() => {
    if (location.pathname.startsWith('/dashboard/requests')) {
      return 'requests';
    }
    if (location.pathname.startsWith('/dashboard/experts')) {
      return 'experts';
    }
    return 'requests';
  });

  const handleTabChange = (_event: React.SyntheticEvent, newValue: string | number) => {
    setTabValue(newValue);
  };

  useEffect(() => {
    if (location.pathname.startsWith('/dashboard/requests')) {
      setTabValue('requests');
    } else if (location.pathname.startsWith('/dashboard/experts')) {
      setTabValue('experts');
    }
  }, [location.pathname]);

  if (!identities || identities.length === 0) {
    return <Navigate to="/profile" />;
  }

  useEffect(() => {
    document.title = 'TA Connect - Dashboard';
  }, []);

  return (
    <Stack spacing={0} sx={{ width: '100%' }}>
      <Stack
        direction="row"
        sx={{
          backgroundColor: 'white',
          borderBottom: '1px solid',
          borderColor: 'grey.300',
          paddingLeft: 3,
          paddingRight: 3,
          paddingTop: 1,
          position: 'sticky',
          top: 48,
          left: 0,
          zIndex: 2,
        }}
      >
        <Tabs
          onChange={handleTabChange}
          value={tabValue}
          textColor="secondary"
          indicatorColor="secondary"
        >
          <Tab
            value="requests"
            disableRipple
            label={
              <AppLink
                to="/requests/active"
                sx={{
                  color: 'inherit',
                  transition: '0.25s',
                  '&:hover': { color: 'secondary.dark' },
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <AssignmentIcon />
                  <Typography>Active</Typography>
                </Stack>
              </AppLink>
            }
            sx={{
              marginRight: 2,
              '&.MuiButtonBase-root': { paddingLeft: 0, paddingRight: 0, textTransform: 'none' },
            }}
            {...a11yProps('requests')}
          />
          <Tab
            value="experts"
            disableRipple
            label={
              <AppLink
                to="/requests/inactive"
                sx={{
                  color: 'inherit',
                  transition: '0.25s',
                  '&:hover': { color: 'secondary.dark' },
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <PeopleIcon />
                  <Typography>Inactive</Typography>
                </Stack>
              </AppLink>
            }
            sx={{
              '&.MuiButtonBase-root': { paddingLeft: 0, paddingRight: 0, textTransform: 'none' },
            }}
            {...a11yProps('experts')}
          />
        </Tabs>
      </Stack>
      <Box component="main" sx={{ flex: 1, overflow: 'hidden', padding: 3 }}>
        <Outlet />
      </Box>
    </Stack>
  );
}
