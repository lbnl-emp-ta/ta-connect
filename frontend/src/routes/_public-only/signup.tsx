import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react';
import { 
        Box, 
        Button, 
        Container, 
        Divider, 
        TextField, 
        Typography } from '@mui/material';
import Grid from "@mui/material/Grid2"
import { useSigupMutation } from '../../utils/queryOptions';


export const Route = createFileRoute('/_public-only/signup')({
  component: SignupForm,
})

function SignupForm() {
    const [email, setEmail] = useState("");
    const [password1, setPassword1] = useState("");
    const [password2, setPassword2] = useState("");

    const signupMutation = useSigupMutation();

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        signupMutation.mutate({ email, password1, password2 });
    }

    return (
        <Container component="section" maxWidth="xs">
            <Box 
                className="form"
                sx={{ 
                    marginTop: 8,
                    padding: 3,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    width: "auto",
                }}
            >
                <Typography component="h1" variant="h5">
                    Sign up
                </Typography>
                <Divider sx={{
                    marginTop: 2,
                    marginBottom: 2,
                }}/>
                <Box
                    component="form"
                    onSubmit={handleSubmit}
                >
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
    )
}