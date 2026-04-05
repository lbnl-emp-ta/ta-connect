import { Box } from '@mui/material';
import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/_with-nav/_private/requests')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Box component="main" sx={{ flex: 1, overflow: 'hidden' }}>
      <Outlet />
    </Box>
  );
}
