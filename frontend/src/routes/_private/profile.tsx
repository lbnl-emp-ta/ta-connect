import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import EditIcon from '@mui/icons-material/Edit';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Container,
  IconButton,
  Link,
  Stack,
  Typography,
} from '@mui/material';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { RolePanel } from '../../features/profile/RolePanel';
import { useUser } from '../../hooks/useUser';
import { identitiesQueryOptions } from '../../utils/queryOptions';
import { useEffect, useState } from 'react';
import { EmailDialog } from '../../features/profile/EmailDialog';

export const Route = createFileRoute('/_private/profile')({
  component: ProfilePage,
});

function ProfilePage() {
  const user = useUser();
  const { data: identities } = useSuspenseQuery(identitiesQueryOptions());
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);

  const handleOpenEmailDialog = () => {
    setIsEmailDialogOpen(true);
  };

  const handleCloseEmailDialog = () => {
    setIsEmailDialogOpen(false);
  };

  useEffect(() => {
    document.title = `TA Connect - ${user?.name || 'Profile'}`;
  }, []);

  return (
    <Container sx={{ marginTop: 2 }}>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ marginBottom: 2 }}>
        <AccountCircleIcon color="primary" sx={{ fontSize: '6rem' }} />
        <Box>
          <Typography variant="h2" component="h1">
            {user?.name}
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="body1" color="text.secondary">
              {user?.email}
            </Typography>
            <IconButton size="small" onClick={handleOpenEmailDialog}>
              <EditIcon />
            </IconButton>
            <EmailDialog open={isEmailDialogOpen} onClose={handleCloseEmailDialog} />
          </Stack>
        </Box>
      </Stack>
      <Stack spacing={2}>
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          sx={{ borderBottom: '1px solid', borderBottomColor: 'grey.300', paddingBottom: 2 }}
        >
          <Typography variant="h4" component="h2" sx={{ flexGrow: 1 }}>
            Roles
          </Typography>
          <Box>
            <Link href="https://forms.gle/etALWnsaZd7ZyFCeA" target="_blank">
              <Button variant="contained">Request a new role</Button>
            </Link>
          </Box>
        </Stack>
        {(!identities || identities.length === 0) && (
          <Alert severity="warning">
            <AlertTitle>You don't have any roles assigned yet.</AlertTitle>
            <Typography>
              To view, track, and modify requests in TA Connect, you must have at least one role.
              You can request a new role using our{' '}
              <Link href="https://forms.gle/etALWnsaZd7ZyFCeA" target="_blank">
                role request form
              </Link>
              . Once approved, you will be able to view the dashboard page the next time you open TA
              Connect.
            </Typography>
          </Alert>
        )}
        {identities && identities.length > 0 && (
          <Stack spacing={2}>
            {identities.map((identity) => (
              <RolePanel identity={identity} key={identity.role.id} />
            ))}
          </Stack>
        )}
      </Stack>
    </Container>
  );
}
