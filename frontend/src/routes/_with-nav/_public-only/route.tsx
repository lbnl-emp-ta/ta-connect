import { createFileRoute, Navigate, Outlet } from '@tanstack/react-router';
import { authSessionQueryOptions } from '@/utils/queryOptions';
import { useSuspenseQuery } from '@tanstack/react-query';

export const Route = createFileRoute('/_with-nav/_public-only')({
  component: PublicOnlyWrapper,
});

function PublicOnlyWrapper() {
  const {
    data: { meta },
  } = useSuspenseQuery(authSessionQueryOptions());

  // authenticated users should not access public-only routes
  if (meta.is_authenticated) {
    return <Navigate to="/requests/active" />;
  }

  return <Outlet />;
}
