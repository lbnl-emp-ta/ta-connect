import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { AppBar, Box, Button, Menu, MenuItem, Stack, Toolbar, Typography } from '@mui/material';
import { type QueryClient } from '@tanstack/react-query';
import { createRootRouteWithContext, Link, Outlet, useNavigate } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { useState } from 'react';
import { TAIdentity } from '../api/dashboard/types';
import { Identity } from '../features/identity/IdentityContext';
import { useUser } from '../hooks/useUser';
import { authSessionQueryOptions, useLogoutMutation } from '../utils/queryOptions';

export interface MyRouterContext {
  queryClient: QueryClient;
  identity: Identity;
  detailedIdentity?: TAIdentity | null;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(authSessionQueryOptions());
  },
  component: Initializer,
});

function Initializer() {
  const user = useUser();
  const navigate = useNavigate();
  const logoutMutation = useLogoutMutation();
  const [userMenuAnchorEl, setUserMenuAnchorEl] = useState<null | HTMLElement>(null);
  const userMenuOpen = Boolean(userMenuAnchorEl);

  const handleUserMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setUserMenuAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchorEl(null);
  };

  const handleProfileClick = () => {
    handleUserMenuClose();
    navigate({ to: '/profile' });
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <Stack spacing={0} sx={{ minHeight: '100vh' }}>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar
          variant="dense"
          sx={{
            display: 'flex',
            gap: 5,
            color: 'primary.main',
            bgcolor: 'white',
          }}
        >
          <Box sx={{ flexGrow: 1 }}>
            <Link to="/dashboard">
              <Typography variant="h6" sx={{ color: 'primary.main' }}>
                TA Connect
              </Typography>
            </Link>
          </Box>
          <Link to="/dashboard">
            <Typography sx={{ color: 'primary.main' }}>Dashboard</Typography>
          </Link>
          <Link to="/intake">
            <Typography sx={{ color: 'primary.main' }}>Intake</Typography>
          </Link>
          {user ? (
            <div>
              <Button
                variant="text"
                onClick={handleUserMenuClick}
                startIcon={<AccountCircleIcon />}
                endIcon={<KeyboardArrowDownIcon />}
                sx={{
                  color: 'primary.main',
                }}
              >
                {user.name || user.email}
              </Button>
              <Menu
                anchorEl={userMenuAnchorEl}
                open={userMenuOpen}
                onClose={handleUserMenuClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
              >
                <MenuItem onClick={handleProfileClick} sx={{ width: 200 }}>
                  Profile
                </MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </div>
          ) : (
            <Link to="/login" search={{ redirect: '/' }}>
              <Typography color="primary">Login</Typography>
            </Link>
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
