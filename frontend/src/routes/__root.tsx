import { Link, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';

import { AppBar, Box, Button, Stack, Toolbar, Typography } from '@mui/material';
import { useSuspenseQuery, type QueryClient } from '@tanstack/react-query';
import { createRootRouteWithContext } from '@tanstack/react-router';
import { authSessionQueryOptions, useLogoutMutation } from '../utils/queryOptions';

export interface MyRouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(authSessionQueryOptions());
  },
  component: Initializer,
});

function Initializer() {
  const {
    data: { isAuthenticated },
  } = useSuspenseQuery(authSessionQueryOptions());

  const logoutMutation = useLogoutMutation();

  function handleLogout(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    e.preventDefault();
    logoutMutation.mutate();
  }

  return (
    <Stack spacing={0} sx={{ minHeight: '100vh' }}>
      <AppBar
        position="sticky"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar
          sx={{
            display: 'flex',
            gap: 5,
            color: 'primary.main',
            bgcolor: 'white',
            minHeight: 100,
            height: 100,
          }}
        >
          <Link to="/dashboard">
            <Typography variant="h6" display="inline" sx={{ color: 'primary.main' }}>
              Dashboard
            </Typography>
          </Link>
          <Link to="/intake">
            <Typography variant="h6" display="inline" sx={{ color: 'primary.main' }}>
              Intake
            </Typography>
          </Link>
          <Box sx={{ margin: 'auto' }} />
          {isAuthenticated ? (
            <Button
              variant="text"
              onClick={handleLogout}
              sx={{
                color: 'primary.main',
              }}
            >
              Logout
            </Button>
          ) : (
            <Box
              sx={{
                display: 'flex',
                gap: 5,
              }}
            >
              <Link to="/login" search={{ redirect: '/' }}>
                <Typography variant="h6" color={'primary.main'}>
                  Login
                </Typography>
              </Link>
              <Link to="/signup">
                <Typography variant="h6" color={'primary.main'}>
                  Signup
                </Typography>
              </Link>
            </Box>
          )}
        </Toolbar>
      </AppBar>
      <Box sx={{ display: 'flex', flex: 1 }}>
        <Outlet />
        <TanStackRouterDevtools />
      </Box>
    </Stack>
  );
}
