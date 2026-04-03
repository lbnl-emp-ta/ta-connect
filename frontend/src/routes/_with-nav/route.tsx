import { Stack, AppBar, Toolbar, Box, Typography, Button, Menu, MenuItem } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { createFileRoute, Link, Outlet, useLocation, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useUser } from '../../hooks/useUser';
import { useLogoutMutation } from '../../utils/queryOptions';
import { IdentityDropdown } from '@/features/identity/IdentityDropdown';

export const Route = createFileRoute('/_with-nav')({
  component: NavbarLayoutWrapper,
});

function NavbarLayoutWrapper() {
  const user = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const logoutMutation = useLogoutMutation();
  const [userMenuAnchorEl, setUserMenuAnchorEl] = useState<null | HTMLElement>(null);
  const userMenuOpen = Boolean(userMenuAnchorEl);
  const showIdentityDropdown =
    location.pathname.startsWith('/requests') || location.pathname.startsWith('/experts');

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
            alignItems: 'center',
            height: 64,
            gap: 2,
            color: 'common.white',
            bgcolor: 'primary.dark',
          }}
        >
          <Stack direction="row" spacing={4} alignItems="center" sx={{ flexGrow: 1 }}>
            <Link to="/requests/active">
              <Typography variant="h6" fontWeight="bold">
                TA Connect
              </Typography>
            </Link>
            <Stack direction="row" spacing={2} alignItems="center">
              <Link to="/requests/active">Requests</Link>
              <Link to="/experts">Experts</Link>
              <Link to="/intake">Intake</Link>
            </Stack>
          </Stack>
          {user ? (
            <>
              {showIdentityDropdown && <IdentityDropdown />}
              <div>
                <Button
                  variant="text"
                  onClick={handleUserMenuClick}
                  startIcon={<AccountCircleIcon />}
                  endIcon={<KeyboardArrowDownIcon />}
                  sx={{
                    color: 'common.white',
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
            </>
          ) : (
            <Link to="/login" search={{ redirect: '/' }}>
              <Typography color="primary">Login</Typography>
            </Link>
          )}
        </Toolbar>
      </AppBar>
      <Box sx={{ display: 'flex', flex: 1 }}>
        <Outlet />
      </Box>
    </Stack>
  );
}
