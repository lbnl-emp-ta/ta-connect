import AssignmentIcon from '@mui/icons-material/Assignment';
import PeopleIcon from '@mui/icons-material/People';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
} from '@mui/material';
import { createFileRoute, Outlet, redirect, useNavigate } from '@tanstack/react-router';
import { identitiesQueryOptions } from '../../../utils/queryOptions';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { TAIdentity } from '../../../api/dashboard/types';
import { useIdentityContext } from '../../../features/identity/IdentityContext';

export const Route = createFileRoute('/_private/dashboard')({
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
  const { setIdentity } = useIdentityContext();
  const { data: identities } = useSuspenseQuery(identitiesQueryOptions());
  const [fullIdentity, setFullIdentity] = useState(identities ? identities[0] : null);

  const handleIdentityChange = (event: SelectChangeEvent<TAIdentity | null>) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setFullIdentity(event.target.value as any);
  };

  useEffect(() => {
    if (fullIdentity) {
      setIdentity({
        user: fullIdentity.user.id,
        role: fullIdentity.role.id,
        location: fullIdentity.location,
        instance: fullIdentity.instance?.id,
      });
    }
  }, [fullIdentity, setIdentity, navigate]);

  return (
    <Stack direction="row" spacing={0} sx={{ width: '100%' }}>
      <Box
        sx={{
          bgcolor: 'primary.main',
          width: 240,
        }}
      >
        <List sx={{ bgcolor: 'primary.main', color: 'white' }}>
          <ListItem>
            <ListItemText>Viewing as:</ListItemText>
          </ListItem>
          <ListItem>
            <Select
              sx={{
                width: 'stretch',
                bgcolor: 'white',
              }}
              value={fullIdentity}
              onChange={handleIdentityChange}
            >
              {identities?.map((identity) => (
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
                <MenuItem key={identity.role.id} value={identity as any}>
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
          </ListItem>
          <ListItem key={'Requests'} disablePadding>
            <ListItemButton
              onClick={() => {
                void navigate({ to: '/dashboard/requests' });
              }}
            >
              <ListItemIcon>
                <AssignmentIcon />
              </ListItemIcon>
              <ListItemText primary={'Requests'} />
            </ListItemButton>
          </ListItem>
          <ListItem key={'Experts'} disablePadding>
            <ListItemButton
              onClick={() => {
                void navigate({ to: '/dashboard/experts' });
              }}
            >
              <ListItemIcon>
                <PeopleIcon />
              </ListItemIcon>
              <ListItemText primary={'Experts'} />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
      <Box component="main" sx={{ flex: 1, overflow: 'hidden', paddingTop: 2 }}>
        <Outlet />
      </Box>
    </Stack>
  );
}
