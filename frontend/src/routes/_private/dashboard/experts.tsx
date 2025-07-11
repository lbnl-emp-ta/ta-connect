import { Container, Stack, Typography } from '@mui/material';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_private/dashboard/experts')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Container maxWidth="xl">
      <Stack>
        <Typography variant="h5" component="h1">
          Experts
        </Typography>
        <Typography>Coming soon!</Typography>
      </Stack>
    </Container>
  );
}
