import { Link, Outlet} from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

import { createRootRouteWithContext } from '@tanstack/react-router'
import { useSuspenseQuery, type QueryClient } from '@tanstack/react-query'
import { AppBar, Box, Button, Toolbar, Typography } from '@mui/material'
import { authSessionQueryOptions, useLogoutMutation } from '../utils/queryOptions'
import COLORS from '../styles/colors'


export interface MyRouterContext {
    queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
    loader: async ({ context }) => {
        await context.queryClient.ensureQueryData(authSessionQueryOptions());
    },
    component: Initializer,
})


function Initializer() {
    const {data: { isAuthenticated } } = useSuspenseQuery(authSessionQueryOptions());

    const logoutMutation = useLogoutMutation();

    function handleLogout(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        e.preventDefault();
        logoutMutation.mutate();
    }

    return (
        <>
        <AppBar position="sticky" sx={{
            zIndex: (theme) => theme.zIndex.drawer + 1,                
        }}>
            <Toolbar sx={{
                display: "flex",
                gap: 5,
                color: COLORS.lblGreen,
                bgcolor: "white",
                minHeight: 100,
                height: 100,
            }}>
                <Link to="/dashboard">
                    <Typography variant='h6' display="inline" sx={{color: COLORS.lblGreen}}>Dashboard</Typography>
                </Link>
                <Link to="/intake">
                    <Typography variant='h6' display="inline" sx={{color: COLORS.lblGreen}}>Intake</Typography>
                </Link>
                <Box sx={{margin: "auto"}}/>
                    {
                        isAuthenticated ? (
                            <Button 
                                variant="text"
                                onClick={handleLogout}
                                sx={{
                                    color: COLORS.lblGreen 
                                }}
                            >
                                Logout
                            </Button>
                        ) : (
                            <Box sx={{
                                display: "flex",
                                gap: 5,
                            }}>
                                <Link 
                                    to="/login"
                                    search={{redirect: "/"}}
                                >
                                    <Typography variant='h6' color={COLORS.lblGreen}>Login</Typography>
                                </Link>
                                <Link to="/signup">
                                    <Typography variant='h6' color={COLORS.lblGreen}>Signup</Typography>
                                </Link>
                            </Box>
                        )
                    }
            </Toolbar>
        </AppBar>
        <Box sx={{
            display: "flex",
            justifyContent: "center",
            minHeight: "80vh",
            padding: 2,
        }}>
            <Outlet />
            <TanStackRouterDevtools />
        </Box>
    </>
    );
}
