import { Link, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

import { createRootRouteWithContext } from '@tanstack/react-router'
import { type QueryClient } from '@tanstack/react-query'
import { Box } from '@mui/material'

export interface MyRouterContext {
    queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
    component: Initializer,
})

function Initializer() {
    return (
        <>
        <Box sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "flex-start",
            gap: 5,
            paddingBottom: 2,
            border: "2px solid green",
            borderBottom: "1px solid",
            width: "auto",
        }}>
            <Link to="/dashboard">
                Dashboard
            </Link>
            {' '}
            <Link to="/login">
                Login
            </Link>
            {' '}
            <Link to="/signup">
                Signup
            </Link>
            {'      '}
            <Link to="/intake">
                Intake
            </Link>
        </Box>
        <Outlet />
        <TanStackRouterDevtools />
    </>
    );
}
