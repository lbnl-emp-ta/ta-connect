import { Box } from '@mui/material';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_private/dashboard/requests/')({
  component: NoSelectedRequest,
});

function NoSelectedRequest() {
  return <Box>Select a request from the table below.</Box>;
}
