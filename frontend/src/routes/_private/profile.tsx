import { Box, Button, Container, Grid, Paper, Stack, Typography } from '@mui/material';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { identitiesQueryOptions } from '../../utils/queryOptions';
import { RolePanel } from '../../features/profile/RolePanel';

export const Route = createFileRoute('/_private/profile')({
  component: ProfilePage,
});

function ProfilePage() {
  const { data: identities } = useSuspenseQuery(identitiesQueryOptions());
  console.log('Identities:', identities);
  return (
    <Container sx={{ marginTop: 2 }}>
      <Typography variant="h2" component="h1" sx={{ marginBottom: 2 }}>
        Welcome to TA Connect!
      </Typography>
      {(!identities || identities.length === 0) && (
        <Paper sx={{ padding: 2, textAlign: 'center' }}>
          <Typography sx={{ marginBottom: 1 }}>You don't have any roles assigned yet.</Typography>
          <Button variant="contained">Request a new role</Button>
        </Paper>
      )}
      {identities && identities.length > 0 && (
        <Stack spacing={2}>
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            sx={{ borderBottom: '1px solid', borderBottomColor: 'grey.300', paddingBottom: 2 }}
          >
            <Typography variant="h4" component="h2">
              Roles
            </Typography>
            <Box>
              <Button variant="contained">Request a new role</Button>
            </Box>
          </Stack>
          <Stack spacing={2}>
            {identities.map((identity) => (
              <RolePanel identity={identity} key={identity.role.id} />
            ))}
          </Stack>
        </Stack>
      )}
    </Container>
  );
}
