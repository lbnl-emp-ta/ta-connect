import { useAdminModeContext } from '@/features/admin-mode/AdminModeContext';
import { RequestsProvider } from '@/features/requests/RequestsContext';
import { RequestsLayout } from '@/features/requests/RequestsLayout';
import { identitiesQueryOptions, requestsQueryOptions } from '@/api/queryOptions';
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
  const { isAdminMode } = useAdminModeContext();
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
