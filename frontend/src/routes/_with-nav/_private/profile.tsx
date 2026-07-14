import {
  identitiesQueryOptions,
  manageableRolesQueryOptions,
  topicsQueryOptions,
} from '@/api/queryOptions';
import { RolesGrid } from '@/features/profile/RolesGrid';
import { RolesManager } from '@/features/profile/RolesManager';
import { UserInfoDialog } from '@/features/profile/UserInfoDialog';
import { useUser } from '@/hooks/useUser';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import EditIcon from '@mui/icons-material/Edit';
import {
  Alert,
  AlertTitle,
  Box,
  Container,
  IconButton,
  Link,
  Stack,
  Typography,
} from '@mui/material';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

export const Route = createFileRoute('/_with-nav/_private/profile')({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(topicsQueryOptions());
    await context.queryClient.ensureQueryData(manageableRolesQueryOptions());
  },
  component: ProfilePage,
});

function ProfilePage() {
  const user = useUser();
  const { data: identities } = useSuspenseQuery(identitiesQueryOptions());
  const hasPlaceholderEmail = !!user?.email?.endsWith('@orcid.placeholder');
  const [isUserInfoDialogOpen, setIsUserInfoDialogOpen] = useState(false);

  const handleOpenUserInfolDialog = () => {
    setIsUserInfoDialogOpen(true);
  };

  const handleCloseUserInfoDialog = () => {
    setIsUserInfoDialogOpen(false);
  };

  useEffect(() => {
    document.title = `TA Connect - ${user?.name || 'Profile'}`;
  }, []);

  return (
    <Container sx={{ paddingTop: 3, paddingBottom: 3 }}>
      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        sx={{
          marginBottom: 2,
          paddingBottom: 2,
          borderBottom: '1px solid',
          borderBottomColor: 'grey.100',
        }}
      >
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
      <Stack spacing={4}>
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
        <RolesGrid identities={identities || []} />
        <RolesManager />
      </Stack>
    </Container>
  );
}
