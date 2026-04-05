import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useRequestsContext } from '@/features/requests/RequestsContext';
import { Stack, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export const Route = createFileRoute('/_with-nav/_private/requests/inactive/')({
  component: NoSelectedRequest,
});

function NoSelectedRequest() {
  const navigate = useNavigate();
  const { sortedRequestsMap } = useRequestsContext();
  const sortedRequests = sortedRequestsMap['inactive'] ?? [];

  /**
   * If the /requests/inactive page is navigated to and there are requests,
   * it should redirect to the first item in the requests list.
   */
  useEffect(() => {
    if (sortedRequests && sortedRequests.length > 0) {
      void navigate({
        to: '/requests/inactive/$requestId',
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
