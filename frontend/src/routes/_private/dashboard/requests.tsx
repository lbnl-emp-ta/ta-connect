import { Button, Grid, Typography } from '@mui/material';
import { createFileRoute } from '@tanstack/react-router';
// import { useState } from 'react'
// import { KeyboardArrowDown, KeyboardArrowUp} from '@mui/icons-material'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import EastIcon from '@mui/icons-material/East';
import WestIcon from '@mui/icons-material/West';
import { RequestInfoTable } from '../../../features/requests/RequestsInfoTable';
import { RequestTable } from '../../../features/requests/RequestsTable';
import COLORS from '../../../styles/colors';
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
    <>
      <Typography
        variant="h5"
        sx={{
          marginLeft: -23,
          fontWeight: 80,
          opacity: 20,
        }}
      >
        Dashboard / Requests
      </Typography>
      <Grid
        container
        spacing={4}
        display="flex"
        justifyContent="center"
        sx={{
          width: 1000,
        }}
      >
        <Grid container size={12}>
          <Grid>
            <Button
              variant="contained"
              sx={{
                bgcolor: 'white',
                color: COLORS.lblGreen,
                borderWidth: 1,
                borderStyle: 'solid',
                borderRadius: 3,
              }}
              startIcon={<WestIcon />}
            >
              Show Previous
            </Button>
          </Grid>
          <Grid>
            <Button
              variant="contained"
              sx={{
                bgcolor: 'white',
                color: COLORS.lblGreen,
                borderWidth: 1,
                borderStyle: 'solid',
                borderRadius: 3,
              }}
              endIcon={<EastIcon />}
            >
              Show Next
            </Button>
          </Grid>
          <Grid
            size={'grow'}
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            <Typography
              variant="h4"
              display={'inline'}
              sx={{
                color: COLORS.lblGreen,
              }}
            >
              View: Request #?
            </Typography>
          </Grid>
          <Button
            variant="contained"
            sx={{
              bgcolor: 'white',
              color: COLORS.lblGreen,
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
            sx={{ bgcolor: COLORS.lblGreen, color: 'white', borderRadius: 3 }}
            endIcon={<EastIcon />}
          >
            Assign
          </Button>
        </Grid>
        <Grid size={6} sx={{ height: 550 }}>
          <RequestInfoTable />
        </Grid>
        <Grid container size={6}>
          <Grid size={12}>
            <Button
              sx={{ height: 'stretch', width: 'stretch', bgcolor: 'blue' }}
            ></Button>
          </Grid>
          <Grid size={12}>
            <Button
              sx={{ height: 'stretch', width: 'stretch', bgcolor: 'blue' }}
            ></Button>
          </Grid>
        </Grid>
        <Grid size={12}>
          <RequestTable />
        </Grid>
      </Grid>
    </>
  );
}
