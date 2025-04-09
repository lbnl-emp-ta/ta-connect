import { Box, Button, Container, Divider, TextField, Typography } from '@mui/material';
import Grid from "@mui/material/Grid2"
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useLayoutEffect, useState } from 'react';
import { useLoginMutation } from '../../utils/queryOptions';

export const Route = createFileRoute('/_public-only/login')({
    validateSearch: (search: Record<string, unknown>): {redirect: string} => {
        return {
            redirect: search.redirect as string || ""
        }
    },
    component: RouteComponent,
})

function RouteComponent() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const loginMutation = useLoginMutation();

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        loginMutation.mutate({email, password});
        router.invalidate();
    }

    useLayoutEffect(() => {

    });

    return (
        <Container 
            sx={{
                display: "flex",
                alignItems: "center",
            }} 
            component="section" 
            maxWidth="xs"
        >
            <Box 
                className="form"
                sx={{ 
                    marginTop: 0,
                    padding: 3,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    width: "auto",
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

