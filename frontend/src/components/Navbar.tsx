import { useLogoutMutation } from '@/api/queryOptions';
import { AppLink } from '@/components/AppLink';
import { AdminModeToggle } from '@/features/admin-mode/AdminModeToggle';
import { useUser } from '@/hooks/useUser';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { AppBar, Button, Menu, MenuItem, Stack, Toolbar, Typography } from '@mui/material';
import { useLocation, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';

export const Navbar: React.FC = () => {
  const user = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const logoutMutation = useLogoutMutation();
  const [userMenuAnchorEl, setUserMenuAnchorEl] = useState<null | HTMLElement>(null);
  const userMenuOpen = Boolean(userMenuAnchorEl);
  const pageHasAdminToggle =
    location.pathname.startsWith('/requests') || location.pathname.startsWith('/experts');

  const activeLinkSx = {
    backgroundColor: 'primary.light',
    borderRadius: 2,
    color: 'primary.main',
    fontWeight: 'bold',
    padding: 1,
  };
  const linkSx = { fontWeight: 'bold' };

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
          <AppLink className="nav-link" to="/requests/active">
            <Typography variant="h5" fontWeight="bold" sx={{ color: 'common.white' }}>
              TA Connect
            </Typography>
          </AppLink>
          <Stack direction="row" spacing={2} alignItems="center">
            <AppLink
              className="nav-link"
              to="/requests/active"
              sx={location.pathname.startsWith('/requests') ? activeLinkSx : linkSx}
              color="inherit"
            >
              Requests
            </AppLink>
            <AppLink
              className="nav-link"
              to="/experts"
              sx={linkSx}
              activeProps={{ sx: activeLinkSx }}
              color="inherit"
            >
              Experts
            </AppLink>
            <AppLink
              className="nav-link"
              to="/customers"
              sx={linkSx}
              activeProps={{ sx: activeLinkSx }}
              color="inherit"
            >
              Customers
            </AppLink>
            <AppLink
              className="nav-link"
              to="/organizations"
              sx={linkSx}
              activeProps={{ sx: activeLinkSx }}
              color="inherit"
            >
              Organizations
            </AppLink>
            <AppLink className="nav-link" to="/intake" color="inherit" sx={linkSx}>
              Intake
            </AppLink>
          </Stack>
        </Stack>
        {user ? (
          <>
            {pageHasAdminToggle && <AdminModeToggle />}
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
          <AppLink className="nav-link" to="/login" search={{ redirect: '/' }}>
            <Typography color="primary">Login</Typography>
          </AppLink>
        )}
      </Toolbar>
    </AppBar>
  );
};
