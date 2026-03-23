import { Stack, AppBar, Toolbar, Box, Typography, Button, Menu, MenuItem } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { createFileRoute, Link, Outlet, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useUser } from '../../hooks/useUser';
import { useLogoutMutation } from '../../utils/queryOptions';

export const Route = createFileRoute('/_with-nav')({
  component: NavbarLayout,
});

function NavbarLayout() {
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
      </Box>
    </Stack>
  );
}
