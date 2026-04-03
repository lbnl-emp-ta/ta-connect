import { useIdentityContext } from '@/features/identity/IdentityContext';
import { RequestsProvider } from '@/features/requests/RequestsContext';
import { RequestsLayout } from '@/features/requests/RequestsLayout';
import { identitiesQueryOptions, requestsQueryOptions } from '@/utils/queryOptions';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_with-nav/_private/requests/active')({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(identitiesQueryOptions());
    await context.queryClient.ensureQueryData(requestsQueryOptions(context.identity));
  },
  component: ActiveRequestsWrapper,
});

function ActiveRequestsWrapper() {
  const { identity } = useIdentityContext();
  const { data: requests } = useSuspenseQuery(requestsQueryOptions(identity));
  const activeRequests = requests ? [...requests.actionable, ...requests.downstream] : null;

  return (
    <RequestsProvider tab="active">
      <RequestsLayout requestsList={activeRequests} />
    </RequestsProvider>
  );
}
