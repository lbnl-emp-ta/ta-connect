import ClearIcon from '@mui/icons-material/Clear';
import { IconButton, Snackbar, SnackbarCloseReason, Stack } from '@mui/material';
import { type QueryClient } from '@tanstack/react-query';
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { TAIdentity } from '../api/dashboard/types';
import { Identity } from '../features/identity/IdentityContext';
import { useToastContext } from '../features/toasts/ToastContext';
import { authSessionQueryOptions } from '../utils/queryOptions';

export interface MyRouterContext {
  queryClient: QueryClient;
  identity: Identity;
  detailedIdentity?: TAIdentity | null;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(authSessionQueryOptions());
  },
  component: TopLevelLayoutWrapper,
});

function TopLevelLayoutWrapper() {
  const { showToast, toastMessage, toastAutoHideDuration, setShowToast } = useToastContext();

  const handleToastClose = (_event: React.SyntheticEvent | Event, reason?: SnackbarCloseReason) => {
    if (reason === 'clickaway') {
      return;
    }
    setShowToast(false);
  };

  return (
    <Stack spacing={0} sx={{ minHeight: '100vh' }}>
      <Outlet />
      <TanStackRouterDevtools />
      <Snackbar
        open={showToast}
        autoHideDuration={toastAutoHideDuration}
        message={toastMessage}
        onClose={handleToastClose}
        action={
          <IconButton size="small" aria-label="close" color="inherit" onClick={handleToastClose}>
            <ClearIcon fontSize="small" />
          </IconButton>
        }
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Stack>
  );
}
