import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { authSessionQueryOptions } from '../../utils/queryOptions'

export const Route = createFileRoute('/_private')({
    beforeLoad: async ({ location, context }) => {
        const { isAuthenticated } = await context.queryClient.ensureQueryData(authSessionQueryOptions());
        if(!isAuthenticated) {
            throw redirect({
                to: "/login",
                search: {
                    // used to redirect back after authenticated
                    redirect: location.href, 
                },
            });
        }
    },
    component: PrivateRoute,
})

function PrivateRoute() {
    return <Outlet/>;
}
