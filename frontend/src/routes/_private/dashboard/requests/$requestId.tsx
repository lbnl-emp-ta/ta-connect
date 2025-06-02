import { Button, Grid, Stack } from '@mui/material';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { RequestInfoTable } from '../../../../features/requests/RequestsInfoTable';
import { customerRequestRelationshipOptions } from '../../../../utils/queryOptions';

export const Route = createFileRoute('/_private/dashboard/requests/$requestId')(
  {
    loader: async ({ context }) => {
      await context.queryClient.ensureQueryData(
        customerRequestRelationshipOptions()
      );
    },
    component: SelectedRequest,
  }
);

function SelectedRequest() {
  console.log('RequestPage loaded');
  const params = Route.useParams();
  const { data: requests } = useSuspenseQuery(
    customerRequestRelationshipOptions()
  );
  const selectedRequest = requests.find(
    (request) => request.id === parseInt(params.requestId)
  );

  return (
    <Grid container>
      <Grid size={6} sx={{ height: 550 }}>
        <RequestInfoTable request={selectedRequest} />
      </Grid>
      <Grid size={6}>
        <Stack>
          <Button
            sx={{ height: 'stretch', width: 'stretch', bgcolor: 'blue' }}
          ></Button>
          <Button
            sx={{ height: 'stretch', width: 'stretch', bgcolor: 'blue' }}
          ></Button>
        </Stack>
      </Grid>
    </Grid>
  );
}
