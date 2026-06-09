import { customersQueryOptions } from '@/api/queryOptions';
import { CustomersDataTable } from '@/features/customers/CustomersDataTable';
import { Container, Stack, Typography } from '@mui/material';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_with-nav/_private/customers')({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(customersQueryOptions());
  },
  component: CustomersPage,
});

function CustomersPage() {
  const { data: customers } = useSuspenseQuery(customersQueryOptions());

  return (
    <Container maxWidth="xl" sx={{ paddingTop: 3, paddingBottom: 3 }}>
      <Stack>
        <Typography variant="h3" component="h1" fontWeight="bold">
          Customers
        </Typography>
        <CustomersDataTable customers={customers} />
      </Stack>
    </Container>
  );
}
