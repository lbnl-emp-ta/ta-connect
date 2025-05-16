import { Link, Outlet} from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

import { createRootRouteWithContext } from '@tanstack/react-router'
import { useSuspenseQuery, type QueryClient } from '@tanstack/react-query'
import { AppBar, Box, Button, Toolbar } from '@mui/material'
import { authSessionQueryOptions, useLogoutMutation } from '../utils/queryOptions'

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
            }}>
                <Link to="/dashboard">
                    Dashboard
                </Link>
                <Link to="/intake">
                    Intake
                </Link>
                <Box sx={{margin: "auto"}}/>
                    {
                        isAuthenticated ? (
                            <Button 
                                variant="text"
                                onClick={handleLogout}
                                sx={{
                                    color: "white"
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
                                    Login
                                </Link>
                                <Link to="/signup">
                                    Signup
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
