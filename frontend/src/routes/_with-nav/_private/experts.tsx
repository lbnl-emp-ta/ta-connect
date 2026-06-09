import { Container, Stack, Typography } from '@mui/material';
import { createFileRoute } from '@tanstack/react-router';
import { expertsQueryOptions } from '@/api/queryOptions';
import { ExpertsDataTable } from '@/features/experts/ExpertsDataTable';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useAdminModeContext } from '@/features/admin-mode/AdminModeContext';

export const Route = createFileRoute('/_with-nav/_private/experts')({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(expertsQueryOptions(context.isAdminMode));
  },
  component: ExpertsPage,
});

function ExpertsPage() {
  const { isAdminMode } = useAdminModeContext();
  const { data: experts } = useSuspenseQuery(expertsQueryOptions(isAdminMode));

  return (
    <Container maxWidth="xl" sx={{ paddingTop: 3, paddingBottom: 3 }}>
      <Stack>
        <Typography variant="h3" component="h1" fontWeight="bold">
          Experts
        </Typography>
        <ExpertsDataTable experts={experts || []} />
      </Stack>
    </Container>
  );
}
