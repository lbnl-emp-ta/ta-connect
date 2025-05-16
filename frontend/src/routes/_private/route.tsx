import { createFileRoute, Navigate, Outlet} from '@tanstack/react-router'
import { authSessionQueryOptions } from '../../utils/queryOptions'
import { useSuspenseQuery } from '@tanstack/react-query';

export const Route = createFileRoute('/_private')({
    component: PrivateRoute,
})

function PrivateRoute() {
    const {data: {isAuthenticated}} = useSuspenseQuery(authSessionQueryOptions());

    // non-authenticated users should not access private routes
    if(!isAuthenticated) {
        return (
            <Navigate to="/login" />
        )
    }
    return <Outlet/>;
}
