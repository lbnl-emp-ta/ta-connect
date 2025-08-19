import AssignmentIcon from '@mui/icons-material/Assignment';
import ClearIcon from '@mui/icons-material/Clear';
import PeopleIcon from '@mui/icons-material/People';
import {
  Box,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Select,
  SelectChangeEvent,
  Snackbar,
  SnackbarCloseReason,
  Stack,
  Typography,
} from '@mui/material';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, Navigate, Outlet, redirect, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { TAIdentity } from '../../../api/dashboard/types';
import { useIdentityContext } from '../../../features/identity/IdentityContext';
import { useToastContext } from '../../../features/toasts/ToastContext';
import { identitiesQueryOptions } from '../../../utils/queryOptions';

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
  const { detailedIdentity, setIdentity, setDetailedIdentity } = useIdentityContext();
  const { showToast, toastMessage, setShowToast } = useToastContext();
  const { data: identities } = useSuspenseQuery(identitiesQueryOptions());

  const handleIdentityChange = (event: SelectChangeEvent<TAIdentity | null>) => {
    setDetailedIdentity(event.target.value as TAIdentity);
  };

  const handleToastClose = (_event: React.SyntheticEvent | Event, reason?: SnackbarCloseReason) => {
    if (reason === 'clickaway') {
      return;
    }

    setShowToast(false);
  };

  useEffect(() => {
    if (detailedIdentity) {
      setIdentity({
        user: detailedIdentity.user.id,
        role: detailedIdentity.role.id,
        location: detailedIdentity.location,
        instance: detailedIdentity.instance?.id,
      });
    } else {
      setDetailedIdentity(identities ? identities[0] : null);
    }
  }, [detailedIdentity, identities, setDetailedIdentity, setIdentity]);

  if (!identities || identities.length === 0) {
    return <Navigate to="/profile" />;
  }

  return (
    <Stack direction="row" spacing={0} sx={{ width: '100%' }}>
      <Box
        sx={{
          bgcolor: 'primary.main',
          width: 240,
        }}
      >
        <Stack
          spacing={1}
          sx={{
            borderBottom: '1px solid',
            borderBottomColor: 'grey.500',
            padding: 2,
            width: '100%',
          }}
        >
          <Typography color="primary.contrastText">Viewing as:</Typography>
          <Select
            sx={{
              width: 'stretch',
              bgcolor: 'white',
            }}
            value={detailedIdentity || ''}
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
        </Stack>
        <List sx={{ bgcolor: 'primary.main', color: 'white' }}>
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
      <Snackbar
        open={showToast}
        autoHideDuration={6000}
        message={toastMessage}
        onClose={handleToastClose}
        action={
          <IconButton size="small" aria-label="close" color="inherit" onClick={handleToastClose}>
            <ClearIcon fontSize="small" />
          </IconButton>
        }
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Stack>
  );
}
