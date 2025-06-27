import { createFileRoute, Outlet } from '@tanstack/react-router';
import { Container, Stack, Typography } from '@mui/material';
import { RequestsProvider } from '../../../../features/requests/RequestsContext';
import { RequestsTable } from '../../../../features/requests/RequestsTable';
import { requestsQueryOptions } from '../../../../utils/queryOptions';

export const Route = createFileRoute('/_private/dashboard/requests')({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(requestsQueryOptions(context.identity));
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
          <RequestsTable />
        </Stack>
      </Container>
    </RequestsProvider>
  );
}
