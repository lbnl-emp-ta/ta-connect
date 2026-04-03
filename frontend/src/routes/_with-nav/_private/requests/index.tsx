import { createFileRoute, redirect } from '@tanstack/react-router';

// Always redirect to /requests/active when user visits /requests
export const Route = createFileRoute('/_with-nav/_private/requests/')({
  beforeLoad() {
    throw redirect({ to: '/requests/active' });
  },
});
