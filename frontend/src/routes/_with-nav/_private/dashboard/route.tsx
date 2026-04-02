import AssignmentIcon from '@mui/icons-material/Assignment';
import PeopleIcon from '@mui/icons-material/People';
import {
  Box,
  InputAdornment,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { useSuspenseQuery } from '@tanstack/react-query';
import {
  createFileRoute,
  Navigate,
  Outlet,
  redirect,
  useLocation,
  useNavigate,
} from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { TAIdentity } from '@/api/dashboard/types';
import { AppLink } from '@/components/AppLink';
import { useIdentityContext } from '@/features/identity/IdentityContext';
import { useRequestsContext } from '@/features/requests/RequestsContext';
import { identitiesQueryOptions } from '@/utils/queryOptions';
import { a11yProps } from '@/utils/utils';

export const Route = createFileRoute('/_with-nav/_private/dashboard')({
  beforeLoad({ location }) {
    if (location.pathname === '/dashboard' || location.pathname === '/dashboard/') {
      throw redirect({ to: '/dashboard/requests' });
    }
  },
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(identitiesQueryOptions());
  },
  component: DashboardComponent,
});

function DashboardComponent() {
  const navigate = useNavigate();
  const location = useLocation();
  const { identity, detailedIdentity, setIdentity, setDetailedIdentity } = useIdentityContext();
  const { setSortedRequests } = useRequestsContext();
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
  const [identitiesMenuOpen, setIdentitiesMenuOpen] = useState(false);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: string | number) => {
    setTabValue(newValue);
  };

  const getIdentityKey = (id: TAIdentity) =>
    `${id.role.id}-${id.location}-${id.instance?.id ?? 'none'}`;

  const handleIdentityChange = (event: SelectChangeEvent<string>) => {
    const selected = identities?.find((id) => getIdentityKey(id) === event.target.value);
    if (selected) setDetailedIdentity(selected);
  };

  useEffect(() => {
    if (detailedIdentity) {
      setIdentity({
        user: detailedIdentity.user.id,
        role: detailedIdentity.role.id,
        location: detailedIdentity.location,
        instance: detailedIdentity.instance?.id,
      });
      if (identity && detailedIdentity.role.id !== identity?.role) {
        setSortedRequests([]);
        navigate({ to: '/dashboard/requests', params: {} });
      }
    } else {
      setDetailedIdentity(identities ? identities[0] : undefined);
    }
  }, [detailedIdentity, identities, setDetailedIdentity, setIdentity]);

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
                to="/dashboard/requests"
                sx={{
                  color: 'inherit',
                  transition: '0.25s',
                  '&:hover': { color: 'secondary.dark' },
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <AssignmentIcon />
                  <Typography>Requests</Typography>
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
                to="/dashboard/experts"
                sx={{
                  color: 'inherit',
                  transition: '0.25s',
                  '&:hover': { color: 'secondary.dark' },
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <PeopleIcon />
                  <Typography>Experts</Typography>
                </Stack>
              </AppLink>
            }
            sx={{
              '&.MuiButtonBase-root': { paddingLeft: 0, paddingRight: 0, textTransform: 'none' },
            }}
            {...a11yProps('experts')}
          />
        </Tabs>
        <Box sx={{ flexGrow: 1 }} />
        <Select
          value={detailedIdentity ? getIdentityKey(detailedIdentity) : ''}
          size="small"
          open={identitiesMenuOpen}
          onOpen={() => setIdentitiesMenuOpen(true)}
          onClose={() => setIdentitiesMenuOpen(false)}
          onChange={handleIdentityChange}
          startAdornment={
            <InputAdornment
              position="start"
              onClick={() => setIdentitiesMenuOpen(true)}
              sx={{ cursor: 'pointer' }}
            >
              Viewing as:
            </InputAdornment>
          }
          sx={{
            backgroundColor: 'white',
            marginBottom: '0.5rem !important',
          }}
        >
          {identities?.map((identity) => (
            <MenuItem key={getIdentityKey(identity)} value={getIdentityKey(identity)}>
              <Stack direction="row" spacing={1}>
                {identity.location === 'Reception' && <span>{identity.location}</span>}
                <span>{identity.role.name}</span>
                {identity.instance && (
                  <>
                    <span>|</span>
                    <span>{identity.instance.name}</span>
                  </>
                )}
              </Stack>
            </MenuItem>
          ))}
        </Select>
      </Stack>
      <Box component="main" sx={{ flex: 1, overflow: 'hidden', padding: 3 }}>
        <Outlet />
      </Box>
    </Stack>
  );
}
