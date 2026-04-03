import { TARequestDetail } from '@/api/dashboard/types';
import { AppLink } from '@/components/AppLink';
import { RequestAssignBackwardButton } from '@/features/requests/RequestAssignBackwardButton';
import { RequestAssignForwardButton } from '@/features/requests/RequestAssignForwardButton';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { IconButton, Stack, Typography } from '@mui/material';
import { useRequestsContext } from './RequestsContext';

interface RequestHeaderProps {
  request: TARequestDetail;
}

/**
 *
 */
export const RequestHeader: React.FC<RequestHeaderProps> = ({ request }) => {
  const { tab, nextId, previousId } = useRequestsContext();

  return (
    <Stack direction="row" justifyContent="space-between">
      <Stack direction="row">
        <Typography
          variant="h6"
          component="h1"
          color="primary"
          sx={{
            fontWeight: 'bold',
          }}
        >
          Request #{request.id}
        </Typography>
        {previousId !== null && (
          <AppLink
            to={`/requests/${tab}/$requestId`}
            params={{
              requestId: previousId.toString(),
            }}
          >
            <IconButton size="small">
              <ChevronLeftIcon />
            </IconButton>
          </AppLink>
        )}
        {previousId === null && (
          <span>
            <IconButton size="small" disabled>
              <ChevronLeftIcon />
            </IconButton>
          </span>
        )}
        {nextId !== null && (
          <AppLink to={`/requests/${tab}/$requestId`} params={{ requestId: nextId.toString() }}>
            <IconButton size="small">
              <ChevronRightIcon />
            </IconButton>
          </AppLink>
        )}
        {nextId === null && (
          <span>
            <IconButton size="small" disabled>
              <ChevronRightIcon />
            </IconButton>
          </span>
        )}
      </Stack>
      <Stack direction="row">
        <RequestAssignBackwardButton request={request} />
        <RequestAssignForwardButton request={request} />
      </Stack>
    </Stack>
  );
};
