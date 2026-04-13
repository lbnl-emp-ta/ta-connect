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
import { RolePanel } from '@/features/profile/RolePanel';
import { useUser } from '@/hooks/useUser';
import { identitiesQueryOptions } from '@/utils/queryOptions';
import { useEffect, useState } from 'react';
import { UserInfoDialog } from '@/features/profile/UserInfoDialog';
import { TAIdentity } from '@/api/dashboard/types';

export const Route = createFileRoute('/_with-nav/_private/profile')({
  component: ProfilePage,
});

function ProfilePage() {
  const user = useUser();
  const { data: identities } = useSuspenseQuery(identitiesQueryOptions());
  const hasPlaceholderEmail = !!user?.email?.endsWith('@orcid.placeholder');
  const [isUserInfoDialogOpen, setIsUserInfoDialogOpen] = useState(false);

  const handleOpenUserInfolDialog = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.blur();
    setIsUserInfoDialogOpen(true);
  };

  const handleCloseUserInfoDialog = () => {
    setIsUserInfoDialogOpen(false);
  };

  const getIdentityKey = (identity: TAIdentity) => {
    return `${identity.role.id}-${identity.location}-${identity.instance?.id ?? 'none'}`;
  };

  useEffect(() => {
    document.title = `TA Connect - ${user?.name || 'Profile'}`;
  }, []);

  return (
    <Container sx={{ paddingTop: 3, paddingBottom: 3 }}>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ marginBottom: 2 }}>
        <AccountCircleIcon color="primary" sx={{ fontSize: '6rem' }} />
        <Box>
          <Typography variant="h2" component="h1">
            {user?.name}
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="body1" color="text.secondary">
              {hasPlaceholderEmail ? 'Missing email address' : user?.email}
            </Typography>
            <IconButton size="small" onClick={handleOpenUserInfolDialog}>
              <EditIcon />
            </IconButton>
            <UserInfoDialog
              open={isUserInfoDialogOpen}
              setOpen={setIsUserInfoDialogOpen}
              onClose={handleCloseUserInfoDialog}
              hasPlaceholderEmail={hasPlaceholderEmail}
            />
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
              <RolePanel identity={identity} key={getIdentityKey(identity)} />
            ))}
          </Stack>
        )}
      </Stack>
    </Container>
  );
}
