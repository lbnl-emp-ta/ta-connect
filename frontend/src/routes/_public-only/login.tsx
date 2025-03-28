import { Box, Button, Container, Divider, TextField, Typography } from '@mui/material';
import Grid from "@mui/material/Grid2"
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react';
import { useLoginMutation } from '../../utils/queryOptions';

export const Route = createFileRoute('/_public-only/login')({
  component: RouteComponent,
})

function RouteComponent() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const loginMutation = useLoginMutation();

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        loginMutation.mutate({email, password});
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
                }}
            >
                <Typography component="h1" variant="h5">
                    Log In
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
                </Box>
            </Box>
        </Container>
    )
}
