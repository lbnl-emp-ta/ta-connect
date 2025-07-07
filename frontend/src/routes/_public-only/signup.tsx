import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Box, Button, Container, Divider, TextField, Typography, Grid } from '@mui/material';
import { useSignupMutation } from '../../utils/queryOptions';

export const Route = createFileRoute('/_public-only/signup')({
  component: SignupForm,
});

function SignupForm() {
  const [email, setEmail] = useState('');
  const [password1, setPassword1] = useState('');
  const [password2, setPassword2] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [passwordHelperText, setPasswordHelperText] = useState('');

  const signupMutation = useSignupMutation();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (password1 !== password2) {
      setPasswordError(true);
      setPasswordHelperText('Passwords must match!');
      return;
    }
    setPasswordError(false);
    setPasswordHelperText('');
    signupMutation.mutate({ email, password: password1 });
  }

  return (
    <Container
      component="section"
      maxWidth="xs"
      sx={{
        display: 'flex',
        alignItems: 'center',
      }}
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
          Sign up
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
                name="password1"
                label="Password"
                type="password"
                id="password1"
                autoComplete="new-password"
                value={password1}
                error={passwordError}
                helperText={passwordHelperText}
                onChange={(e) => setPassword1(e.target.value)}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                required
                fullWidth
                name="password2"
                label="Retype Password"
                type="password"
                id="password2"
                autoComplete="new-password"
                value={password2}
                error={passwordError}
                helperText={passwordHelperText}
                onChange={(e) => setPassword2(e.target.value)}
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
        </Box>
      </Box>
    </Container>
  );
}
