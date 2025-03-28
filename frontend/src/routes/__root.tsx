import { Link, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

import { createRootRouteWithContext } from '@tanstack/react-router'
import { type QueryClient } from '@tanstack/react-query'

export interface MyRouterContext {
    queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
    component: Initializer,
})

function Initializer() {
    return (
        <>
        <div>
            <Link to="/dashboard">
                Dashboard
            </Link>
            {' '}
            <Link to="/intake">
                Intake
            </Link>
            {' '}
            <Link to="/signup">
                Signup
            </Link>
        </div>
        <hr />
        <Outlet />
        <TanStackRouterDevtools />
    </>
    );
}
