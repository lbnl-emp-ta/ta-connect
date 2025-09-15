import { Container, Stack } from '@mui/material';
import { createFileRoute } from '@tanstack/react-router';
import { expertsQueryOptions } from '../../../utils/queryOptions';
import { ExpertsDataTable } from '../../../features/experts/ExpertsDataTable';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useIdentityContext } from '../../../features/identity/IdentityContext';

export const Route = createFileRoute('/_private/dashboard/experts')({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(expertsQueryOptions(context.identity));
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { identity } = useIdentityContext();
  const { data: experts } = useSuspenseQuery(expertsQueryOptions(identity));
  console.log('experts', experts);
  return (
    <Container maxWidth="xl">
      <Stack>
        <ExpertsDataTable experts={experts || []} />
      </Stack>
    </Container>
  );
}
