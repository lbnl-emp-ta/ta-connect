import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_private/dashboard/experts')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_private/dashboard/experts"!</div>;
}
