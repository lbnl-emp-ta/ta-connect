import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { authSessionQueryOptions } from '../../utils/queryOptions'

export const Route = createFileRoute('/_public-only')({
    beforeLoad: async ({ context }) => {
            const { isAuthenticated } = await context.queryClient.ensureQueryData(authSessionQueryOptions());
            if(isAuthenticated) {
                throw redirect({
                    to: "/dashboard",
                });
            }
        },
    component: PublicRoute,
})

function PublicRoute() {
    return <Outlet/>
}
