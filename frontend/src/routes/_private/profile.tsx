import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Container,
  Link,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { identitiesQueryOptions } from '../../utils/queryOptions';
import { RolePanel } from '../../features/profile/RolePanel';
import { useUser } from '../../hooks/useUser';

export const Route = createFileRoute('/_private/profile')({
  component: ProfilePage,
});

function ProfilePage() {
  const user = useUser();
  const { data: identities } = useSuspenseQuery(identitiesQueryOptions());
  console.log('Identities:', identities);
  return (
    <Container sx={{ marginTop: 2 }}>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ marginBottom: 2 }}>
        <AccountCircleIcon color="primary" sx={{ fontSize: '6rem' }} />
        <Box>
          <Typography variant="h2" component="h1">
            {user?.name}
          </Typography>
          <Typography>{user?.email}</Typography>
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
