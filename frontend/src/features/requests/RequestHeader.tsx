import { TARequestDetail } from '@/api/dashboard/types';
import { AppLink } from '@/components/AppLink';
import { RequestAssignBackwardButton } from '@/features/requests/RequestAssignBackwardButton';
import { RequestAssignForwardButton } from '@/features/requests/RequestAssignForwardButton';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { IconButton, Stack, Typography, Drawer, Box } from '@mui/material';
import { useRequestsContext } from './RequestsContext';
import { ExpertsDataTable } from '@/features/experts/ExpertsDataTable';
import { useSuspenseQuery } from '@tanstack/react-query';
import { expertsQueryOptions } from '@/utils/queryOptions';
import { useIdentityContext } from '@/features/identity/IdentityContext';

interface RequestHeaderProps {
  request: TARequestDetail;
}

/**
 * Top header section to show in the request detail view
 */
export const RequestHeader: React.FC<RequestHeaderProps> = ({ request }) => {
  const { identity } = useIdentityContext();
  const { tab, nextId, previousId, expertsPanelOpen, setExpertsPanelOpen } = useRequestsContext();
  const { data: experts } = useSuspenseQuery(expertsQueryOptions(identity));

  const handleCloseExpertsPanel = () => {
    setExpertsPanelOpen(false);
  };

  return (
    <Stack direction="row" alignItems="center" justifyContent="space-between">
      <Stack spacing={0}>
        <Typography
          variant="h3"
          component="h1"
          sx={{
            fontWeight: 'bold',
          }}
        >
          {request.customers[0].name} ({request.customers[0].state.abbreviation})
        </Typography>
        <Stack direction="row" alignItems="center">
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
          <Typography variant="h6" component="h2" color="grey.600">
            Request #{request.id}
          </Typography>
        </Stack>
      </Stack>
      <Stack direction="row">
        <RequestAssignBackwardButton request={request} />
        <RequestAssignForwardButton request={request} />
      </Stack>
      <Drawer
        anchor="right"
        open={expertsPanelOpen}
        onClose={handleCloseExpertsPanel}
        sx={{ zIndex: 1202 }}
      >
        <Box sx={{ width: 1000 }}>
          <ExpertsDataTable experts={experts || []} />
        </Box>
      </Drawer>
    </Stack>
  );
};
