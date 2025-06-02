import { Stack, Typography } from '@mui/material';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_private/dashboard/requests/')({
  component: NoSelectedRequest,
});

function NoSelectedRequest() {
  return (
    <Stack sx={{ height: 550, justifyContent: 'center', alignItems: 'center' }}>
      <Typography>Select a request from the table below.</Typography>
    </Stack>
  );
}
