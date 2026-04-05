import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, Navigate } from '@tanstack/react-router';
import { authSessionQueryOptions } from '../../utils/queryOptions';

export const Route = createFileRoute('/(public)/account/provider/callback')({
  loader: async ({ context }) => {
    // Force a fresh auth session fetch — the OAuth redirect is a full page
    // navigation, so the stale cache still shows unauthenticated even though
    // the backend just logged us in.
    await context.queryClient.invalidateQueries({ queryKey: ['authSession'] });
    await context.queryClient.fetchQuery(authSessionQueryOptions());
  },
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
    data: { meta },
  } = useSuspenseQuery(authSessionQueryOptions());

  // Check for OAuth errors BEFORE checking auth status — a provider error
  // means the login was rejected, so the user will never be authenticated here.
  if (error) {
    return (
      <div>
        <p>
          Login failed: <strong>{error}</strong>
        </p>
        <a href="/login">Back to login</a>
      </div>
    );
  }

  if (!meta.is_authenticated) {
    return <Navigate to="/login" />;
  }

  return <Navigate to={'/requests/active'} />;
}
