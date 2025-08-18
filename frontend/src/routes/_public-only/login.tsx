import GoogleIcon from '@mui/icons-material/Google';
import MicrosoftIcon from '@mui/icons-material/Microsoft';
import { Box, Container, Grid, Link, Paper, Stack, Typography } from '@mui/material';
import { createFileRoute } from '@tanstack/react-router';
import { SocialLoginButton } from '../../components/SocialLoginButton';
import imagePath from '../../assets/lbnl.png';

export const Route = createFileRoute('/_public-only/login')({
  beforeLoad: ({ context }) => {
    context.queryClient.invalidateQueries({
      queryKey: ['identities'],
    });
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Container sx={{ marginTop: 6 }}>
      <Grid
        container
        spacing={4}
        direction={{
          xs: 'column-reverse',
          sm: 'column-reverse',
          md: 'row',
        }}
        // sx={(theme) => ({
        //   [theme.breakpoints.down('sm')]: {
        //     flexDirection: 'column-reverse',
        //   },
        // })}
      >
        <Grid
          size={{ sm: 12, md: 6 }}
          sx={{
            position: 'relative',
          }}
        >
          <img src={imagePath} style={{ borderRadius: 4, width: '100%', height: 'auto' }} />
          <Stack
            sx={{
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              padding: '1rem',
              color: 'white',
              position: 'absolute',
              top: '50%',
              transform: 'translateY(-50%)',
              left: '1.5rem',
              right: '1.5rem',
              zIndex: 2,
            }}
          >
            <Typography variant="h2" component="h1" fontWeight="bold">
              TA Connect
            </Typography>
            <Typography fontWeight="bold">
              A technical assistance tracking and reporting platform that enables partnered national
              laboratories, each hosting various TA programs, to coordinate their efforts.
            </Typography>
          </Stack>
        </Grid>
        <Grid
          size={{ sm: 12, md: 6 }}
          sx={{
            display: 'flex',
            flexGrow: 1,
            justifyContent: 'center',
          }}
        >
          <Box>
            <Paper sx={{ padding: 4 }}>
              <Stack>
                <Typography
                  component="h2"
                  variant="h5"
                  sx={{
                    borderBottom: '1px solid',
                    borderBottomColor: 'grey.400',
                    textAlign: 'center',
                    marginBottom: 2,
                    paddingBottom: 2,
                  }}
                >
                  Login
                </Typography>
                <SocialLoginButton name="Google" id="google" startIcon={<GoogleIcon />} />
                <SocialLoginButton name="Microsoft" id="microsft" startIcon={<MicrosoftIcon />} />
                <Typography
                  sx={{
                    borderTop: '1px solid',
                    borderTopColor: 'grey.400',
                    marginTop: 2,
                    paddingTop: 2,
                  }}
                >
                  For more information about the State TA Program visit the{' '}
                  <Link href="https://emp.lbl.gov/projects/state-TA-program">program website</Link>.
                </Typography>
              </Stack>
            </Paper>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
}
