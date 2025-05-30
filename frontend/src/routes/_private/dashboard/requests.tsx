import { Button, Container, Grid, Stack, Typography } from '@mui/material';
import { createFileRoute } from '@tanstack/react-router';
// import { useState } from 'react'
// import { KeyboardArrowDown, KeyboardArrowUp} from '@mui/icons-material'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import EastIcon from '@mui/icons-material/East';
import WestIcon from '@mui/icons-material/West';
import { RequestInfoTable } from '../../../features/requests/RequestsInfoTable';
import { RequestTable } from '../../../features/requests/RequestsTable';
import { customerRequestRelationshipOptions } from '../../../utils/queryOptions';

export const Route = createFileRoute('/_private/dashboard/requests')({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(
      customerRequestRelationshipOptions()
    );
  },
  component: RequestsPage,
});

function RequestsPage() {
  return (
    <Container maxWidth="xl">
      <Stack>
        <Typography variant="h5" component="h1">
          Dashboard / Requests
        </Typography>
        <Stack direction="row">
          <Button
            variant="contained"
            sx={{
              bgcolor: 'white',
              color: 'primary.main',
              borderWidth: 1,
              borderStyle: 'solid',
              borderRadius: 3,
            }}
            startIcon={<WestIcon />}
          >
            Show Previous
          </Button>
          <Button
            variant="contained"
            sx={{
              bgcolor: 'white',
              color: 'primary.main',
              borderWidth: 1,
              borderStyle: 'solid',
              borderRadius: 3,
            }}
            endIcon={<EastIcon />}
          >
            Show Next
          </Button>
          <Typography
            variant="h4"
            sx={{
              flex: 1,
              color: 'primary.main',
            }}
          >
            View: Request #?
          </Typography>
          <Button
            variant="contained"
            sx={{
              bgcolor: 'white',
              color: 'primary.main',
              borderWidth: 1,
              borderStyle: 'solid',
              borderRadius: 3,
            }}
            endIcon={<ArrowDropDownIcon />}
          >
            More Actions
          </Button>
          <Button
            variant="contained"
            sx={{ bgcolor: 'primary.main', color: 'white', borderRadius: 3 }}
            endIcon={<EastIcon />}
          >
            Assign
          </Button>
        </Stack>
        <Grid container>
          <Grid size={6} sx={{ height: 550 }}>
            <RequestInfoTable />
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
        <RequestTable />
      </Stack>
    </Container>
  );
}
