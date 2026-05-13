import { RequestDetailLayout } from '@/features/requests/RequestDetailLayout';
import {
  expertsQueryOptions,
  notesQueryOptions,
  ownersQueryOptions,
  requestDetailQueryOptions,
  topicsQueryOptions,
} from '@/api/queryOptions';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_with-nav/_private/requests/active/$requestId')({
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData(
      requestDetailQueryOptions(params.requestId, context.isAdminMode)
    );
    await context.queryClient.ensureQueryData(ownersQueryOptions(context.isAdminMode));
    await context.queryClient.ensureQueryData(topicsQueryOptions());
    await context.queryClient.ensureQueryData(
      notesQueryOptions(params.requestId, context.isAdminMode)
    );
    await context.queryClient.ensureQueryData(expertsQueryOptions(context.isAdminMode));
  },
  component: ActiveRequestDetailPage,
});

function ActiveRequestDetailPage() {
  const params = Route.useParams();
  return <RequestDetailLayout requestId={params.requestId} />;
}
