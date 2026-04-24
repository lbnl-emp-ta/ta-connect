import { identitiesQueryOptions } from '@/api/queryOptions';
import { Box } from '@mui/material';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, Navigate, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/_with-nav/_private/requests')({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(identitiesQueryOptions());
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { data: identities } = useSuspenseQuery(identitiesQueryOptions());

  // If the user has no identities, they shouldn't access any requests pages
  if (!identities || identities.length === 0) {
    return <Navigate to="/profile" />;
  }

  return (
    <Box component="main" sx={{ flex: 1, overflow: 'hidden' }}>
      <Outlet />
    </Box>
  );
}
