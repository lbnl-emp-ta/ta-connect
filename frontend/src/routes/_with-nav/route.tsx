import { Navbar } from '@/components/Navbar';
import { Box, Stack } from '@mui/material';
import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/_with-nav')({
  component: NavbarLayoutWrapper,
});

function NavbarLayoutWrapper() {
  return (
    <Stack spacing={0} sx={{ minHeight: '100vh' }}>
      <Navbar />
      <Box sx={{ display: 'flex', flex: 1 }}>
        <Outlet />
      </Box>
    </Stack>
  );
}
