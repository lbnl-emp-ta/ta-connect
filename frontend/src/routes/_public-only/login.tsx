import {
  Grid,
  Box,
  Button,
  Container,
  Divider,
  TextField,
  Typography,
} from '@mui/material';
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { useLoginMutation } from '../../utils/queryOptions';
import { getCSRFToken } from '../../utils/cookies';

export const Route = createFileRoute('/_public-only/login')({
  component: RouteComponent,
});

function RouteComponent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const loginMutation = useLoginMutation();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    loginMutation.mutate({ email, password });
  }

  return (
    <Container
      sx={{
        display: 'flex',
        alignItems: 'center',
      }}
      component="section"
      maxWidth="xs"
    >
      <Box
        className="form"
        sx={{
          marginTop: 0,
          padding: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: 'auto',
        }}
      >
        <Typography component="h1" variant="h5">
          Login
        </Typography>
        <Divider
          sx={{
            marginTop: 2,
            marginBottom: 2,
          }}
        />
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid size={12}>
              <TextField
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Grid>
          </Grid>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{
              marginTop: 2,
              marginBottom: 2,
            }}
          >
            Submit
          </Button>
          <LoginWithSocialButton name="Google" id="googleauth2" />
        </Box>
      </Box>
    </Container>
  );
}

interface LoginWithSocialButtonProps {
  name: string;
  id: string;
}

export default function LoginWithSocialButton({
  name,
  id,
}: LoginWithSocialButtonProps) {
  function handleClick() {
    const form = document.createElement('form');
    form.style.display = 'none';
    form.method = 'POST';
    form.action = `${import.meta.env.VITE_API_URL}/_allauth/browser/v1/auth/provider/redirect`;
    const data = {
      provider: id,
      callback_url:
        'http://taconnect-local.lbl.gov:1337/api/account/provider/callback',
      csrfmiddlewaretoken: getCSRFToken() || '',
      process: 'login',
    };

    Object.entries(data).forEach(([k, v]) => {
      const input = document.createElement('input');
      input.name = k;
      input.value = v;
      form.appendChild(input);
    });
    document.body.appendChild(form);
    form.submit();
  }
  return (
    <Button onClick={handleClick} fullWidth variant="contained">
      Login with {name}
    </Button>
  );
}
