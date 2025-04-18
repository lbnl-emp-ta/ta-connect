import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_private/dashboard/test-tab')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_private/dashboard/test-tab"!</div>
}
