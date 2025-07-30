import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, Navigate } from '@tanstack/react-router';
import { authSessionQueryOptions } from '../../utils/queryOptions';

export const Route = createFileRoute('/(public)/account/provider/callback')({
  component: CallbackComponent,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      error: typeof search.error === 'string' ? search.error : undefined,
    };
  },
});

function CallbackComponent() {
  const { error } = Route.useSearch();
  const {
    data: { isAuthenticated },
  } = useSuspenseQuery(authSessionQueryOptions());

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (!error) {
    return <Navigate to={'/dashboard'} />;
  }

  return (
    <div>
      <p>Processing login...</p>
    </div>
  );
}
