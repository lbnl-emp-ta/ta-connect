import { organizationsQueryOptions } from '@/api/queryOptions';
import { OrganizationsDataTable } from '@/features/organizations/OrganizationsDataTable';
import { Container, Stack, Typography } from '@mui/material';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_with-nav/_private/organizations')({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(organizationsQueryOptions());
  },
  component: OrganizationsPage,
});

function OrganizationsPage() {
  const { data: organizations } = useSuspenseQuery(organizationsQueryOptions());

  return (
    <Container maxWidth="xl" sx={{ paddingTop: 3, paddingBottom: 3 }}>
      <Stack>
        <Typography variant="h3" component="h1" fontWeight="bold">
          Organizations
        </Typography>
        <OrganizationsDataTable organizations={organizations} />
      </Stack>
    </Container>
  );
}
