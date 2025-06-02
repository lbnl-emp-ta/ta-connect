import AssignmentIcon from '@mui/icons-material/Assignment';
import PeopleIcon from '@mui/icons-material/People';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Select,
  Stack,
} from '@mui/material';
import { createFileRoute, Outlet, redirect, useNavigate } from '@tanstack/react-router';

export const Route = createFileRoute('/_private/dashboard')({
  beforeLoad({ location }) {
    if (location.pathname === '/dashboard' || location.pathname === '/dashboard/')
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw redirect({ to: '/dashboard/requests' });
  },
  component: DashboardComponent,
});

function DashboardComponent() {
  const navigate = useNavigate();

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
            <ListItemText primary={'Viewing as:'}></ListItemText>
          </ListItem>
          <ListItem>
            <Select
              sx={{
                width: 'stretch',
                bgcolor: 'white',
              }}
            />
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
      <Box component="main" sx={{ flex: 1, overflow: 'hidden' }}>
        <Outlet />
      </Box>
    </Stack>
  );
}
