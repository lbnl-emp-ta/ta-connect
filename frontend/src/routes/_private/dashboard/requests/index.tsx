import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useRequestsContext } from '../../../../features/requests/RequestsContext';
import { Stack, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export const Route = createFileRoute('/_private/dashboard/requests/')({
  component: NoSelectedRequest,
});

function NoSelectedRequest() {
  const navigate = useNavigate();
  const { sortedRequests } = useRequestsContext();

  /**
   * If the /dashboard/requests page is navigated to and there are actionable requests,
   * it should redirect to the first item in the requests table.
   */
  useEffect(() => {
    if (sortedRequests && sortedRequests.length > 0) {
      void navigate({
        to: '/dashboard/requests/$requestId',
        params: { requestId: sortedRequests[0].id.toString() },
      });
    }
  }, [navigate, sortedRequests]);

  /**
   * If there aren't any requests in the actionable tab,
   * then show a message.
   */
  return (
    <Stack sx={{ textAlign: 'center', height: 500, justifyContent: 'center' }} spacing={2}>
      <Stack direction="row" alignItems="center" justifyContent="center">
        <Typography>All caught up!</Typography>
        <CheckCircleIcon color="primary" fontSize="large" />
      </Stack>
      <Typography>No requests on the docket.</Typography>
    </Stack>
  );
}
