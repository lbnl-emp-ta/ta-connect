import { useAdminModeContext } from '@/features/admin-mode/AdminModeContext';
import { RequestsProvider } from '@/features/requests/RequestsContext';
import { RequestsLayout } from '@/features/requests/RequestsLayout';
import { identitiesQueryOptions, requestsQueryOptions } from '@/api/queryOptions';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_with-nav/_private/requests/active')({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(identitiesQueryOptions());
    await context.queryClient.ensureQueryData(requestsQueryOptions(context.isAdminMode));
  },
  component: ActiveRequestsWrapper,
});

function ActiveRequestsWrapper() {
  const { isAdminMode } = useAdminModeContext();
  const { data: requests } = useSuspenseQuery(requestsQueryOptions(isAdminMode));
  const activeRequests = [
    {
      id: 'actionable',
      heading: 'Actionable',
      requests: requests ? requests.actionable : null,
    },
    {
      id: 'downstream',
      heading: 'Downstream',
      requests: requests ? requests.downstream : null,
    },
  ];

  return (
    <RequestsProvider tab="active">
      <RequestsLayout requestLists={activeRequests} />
    </RequestsProvider>
  );
}
