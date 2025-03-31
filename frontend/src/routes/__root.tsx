import { Link, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

import { createRootRouteWithContext } from '@tanstack/react-router'
import { type QueryClient } from '@tanstack/react-query'
import { AppBar, Box, Toolbar } from '@mui/material'

export interface MyRouterContext {
    queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
    component: Initializer,
})

function Initializer() {
    return (
        <>
        <AppBar position="sticky">
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
                <Link to="/login">
                    Login
                </Link>
                <Link to="/signup">
                    Signup
                </Link>
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
