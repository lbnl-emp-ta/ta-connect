import GoogleIcon from '@mui/icons-material/Google';
import MicrosoftIcon from '@mui/icons-material/Microsoft';
import { Container, Paper, Stack, Typography } from '@mui/material';
import { createFileRoute } from '@tanstack/react-router';
import { SocialLoginButton } from '../../components/SocialLoginButton';

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
    <Container
      sx={{
        display: 'flex',
        alignItems: 'center',
      }}
      component="section"
      maxWidth="xs"
    >
      <Paper sx={{ padding: 2 }}>
        <Stack>
          <Typography
            component="h1"
            variant="h5"
            sx={{
              borderBottom: '1px solid',
              borderBottomColor: 'grey.400',
              textAlign: 'center',
              marginBottom: 2,
              paddingBottom: 2,
            }}
          >
            Login to TA Connect
          </Typography>
          <SocialLoginButton name="Google" id="google" startIcon={<GoogleIcon />} />
          <SocialLoginButton name="Microsoft" id="microsft" startIcon={<MicrosoftIcon />} />
        </Stack>
      </Paper>
    </Container>
  );
}
