import { createFileRoute, Navigate, Outlet } from '@tanstack/react-router'
import { authSessionQueryOptions } from '../../utils/queryOptions'
import { useSuspenseQuery } from '@tanstack/react-query';

export const Route = createFileRoute('/_private')({
    loader: (opts) => (
        opts.context.queryClient.ensureQueryData(authSessionQueryOptions())
    ),
    component: PrivateRoute,
})

function PrivateRoute() {
    const { data } = useSuspenseQuery(authSessionQueryOptions());

    if(data.isAuthenticated) {
        return <Outlet/>;
    }

    return <Navigate to='/signup'/>
}
