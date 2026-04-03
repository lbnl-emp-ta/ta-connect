import { useIdentityContext } from '@/features/identity/IdentityContext';
import { RequestsProvider } from '@/features/requests/RequestsContext';
import { RequestsLayout } from '@/features/requests/RequestsLayout';
import { identitiesQueryOptions, requestsQueryOptions } from '@/utils/queryOptions';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_with-nav/_private/requests/inactive')({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(identitiesQueryOptions());
    await context.queryClient.ensureQueryData(requestsQueryOptions(context.identity));
  },
  component: InactiveRequestsWrapper,
});

function InactiveRequestsWrapper() {
  const { identity } = useIdentityContext();
  const { data: requests } = useSuspenseQuery(requestsQueryOptions(identity));
  const inactiveRequests = [
    {
      id: 'inactive',
      requests: requests ? requests.inactive : null,
    },
  ];

  return (
    <RequestsProvider tab="inactive">
      <RequestsLayout requestLists={inactiveRequests} />
    </RequestsProvider>
  );
}
