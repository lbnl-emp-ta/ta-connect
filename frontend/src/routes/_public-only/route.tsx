import { createFileRoute, Navigate, Outlet } from '@tanstack/react-router'
import { authSessionQueryOptions } from '../../utils/queryOptions'
import { useSuspenseQuery } from '@tanstack/react-query';

export const Route = createFileRoute('/_public-only')({
    loader: (opts) => (
        opts.context.queryClient.ensureQueryData(authSessionQueryOptions())
    ),
    component: RouteComponent,
})

function RouteComponent() {
    const { data: { isAuthenticated } } = useSuspenseQuery(authSessionQueryOptions());

    if(isAuthenticated) {
        return <Navigate to='/dashboard'/>;
    }

    return <Outlet/>
}
