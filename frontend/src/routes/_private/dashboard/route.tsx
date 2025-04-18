import { createFileRoute, Outlet, redirect,} from '@tanstack/react-router'

export const Route = createFileRoute('/_private/dashboard')({
    beforeLoad ({ location }) {
        if (location.pathname === "/dashboard" || location.pathname ==="/dashboard/")
            // eslint-disable-next-line @typescript-eslint/only-throw-error
            throw redirect({ to: "/dashboard/request-table" })
    },
    component: DashboardComponent, 
})

function DashboardComponent() {
    return (
        <Outlet></Outlet>
    )
}
