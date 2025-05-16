import { createFileRoute, Navigate, Outlet} from '@tanstack/react-router'
import { authSessionQueryOptions } from '../../utils/queryOptions'
import { useSuspenseQuery } from '@tanstack/react-query';

export const Route = createFileRoute('/_public-only')({
    component: PublicOnlyRoute,
})

function PublicOnlyRoute() {
    const {data: {isAuthenticated}} = useSuspenseQuery(authSessionQueryOptions());

    // authenticated users should not access public-only routes
    if(isAuthenticated) {
        return (
            <Navigate to="/dashboard" />
        )
    }

    return <Outlet/>
}
