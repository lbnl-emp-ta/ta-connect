import { createFileRoute, Outlet } from '@tanstack/react-router';
import { Container, Stack, Typography } from '@mui/material';
import { RequestsProvider } from '../../../../features/requests/RequestsContext';
import { RequestTable } from '../../../../features/requests/RequestsTable';
import { customerRequestRelationshipOptions } from '../../../../utils/queryOptions';

export const Route = createFileRoute('/_private/dashboard/requests')({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(customerRequestRelationshipOptions());
  },
  component: RequestsPage,
});

function RequestsPage() {
  return (
    <RequestsProvider>
      <Container maxWidth="xl">
        <Stack>
          <Typography variant="h5" component="h1">
            Dashboard / Requests
          </Typography>
          <Outlet />
          <RequestTable />
        </Stack>
      </Container>
    </RequestsProvider>
  );
}
