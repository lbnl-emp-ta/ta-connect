import { TARequest } from '@/api/dashboard/types';
import { AppLink } from '@/components/AppLink';
import { useIdentityContext } from '@/features/identity/IdentityContext';
import { useRequestsContext } from '@/features/requests/RequestsContext';
import { RequestsList } from '@/features/requests/RequestsList';
import { a11yProps } from '@/utils/utils';
import SortIcon from '@mui/icons-material/Sort';
import {
  Badge,
  Box,
  Container,
  InputAdornment,
  MenuItem,
  Select,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { Outlet } from '@tanstack/react-router';
import { useEffect } from 'react';

interface RequestsLayoutProps {
  requestsList: TARequest[] | null;
}

export const RequestsLayout: React.FC<RequestsLayoutProps> = ({ requestsList }) => {
  const { identity, detailedIdentity, setIdentity, setDetailedIdentity } = useIdentityContext();
  const { tab, sortField, setSortField, setSortedRequests } = useRequestsContext();

  useEffect(() => {
    if (detailedIdentity && identity && detailedIdentity.role.id !== identity?.role) {
      setSortedRequests([]);
    }
  }, [detailedIdentity, setDetailedIdentity, setIdentity]);

  return (
    <Stack direction="row" sx={{ height: '100%' }}>
      <Box
        component="aside"
        sx={{
          flexBasis: 500,
          minWidth: 500,
        }}
      >
        {requestsList && (
          <>
            <Stack direction="row" sx={{ marginBottom: 2 }}>
              <Tabs
                value={tab}
                aria-label="requests tabs"
                sx={{
                  backgroundColor: 'grey.400',
                  borderRadius: 1,
                  display: 'inline-flex',
                  padding: 0.5,
                  '& .MuiButtonBase-root': {
                    borderRadius: 1,
                    textTransform: 'none',
                  },
                  '& .MuiTab-root.Mui-selected': {
                    backgroundColor: 'white',
                  },
                  '& .MuiTabs-indicator': {
                    height: 0,
                  },
                }}
              >
                <Tab
                  label={
                    <AppLink
                      to="/requests/active"
                      sx={{
                        color: 'inherit',
                        transition: '0.25s',
                        '&:hover': { color: 'secondary.dark' },
                      }}
                    >
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Typography>Active</Typography>
                        <Badge badgeContent={requestsList.length.toString()} color="primary" />
                      </Stack>
                    </AppLink>
                  }
                  value="active"
                  {...a11yProps('active')}
                />
                <Tab
                  label={
                    <AppLink
                      to="/requests/inactive"
                      sx={{
                        color: 'inherit',
                        transition: '0.25s',
                        '&:hover': { color: 'secondary.dark' },
                      }}
                    >
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Typography>Inactive</Typography>
                        <Badge badgeContent={requestsList.length.toString()} color="primary" />
                      </Stack>
                    </AppLink>
                  }
                  value="inactive"
                  {...a11yProps('inactive')}
                />
              </Tabs>
              <Select
                value={sortField}
                startAdornment={
                  <InputAdornment position="start">
                    <SortIcon />
                  </InputAdornment>
                }
                onChange={(e) => setSortField(e.target.value)}
              >
                <MenuItem value="-date_created">Newest first</MenuItem>
                <MenuItem value="date_created">Oldest first</MenuItem>
                <MenuItem value="status">Status</MenuItem>
              </Select>
            </Stack>
            <RequestsList requests={requestsList} />
          </>
        )}
        {!requestsList && <Typography variant="body1">Failed to load requests.</Typography>}
      </Box>
      <Box sx={{ flexGrow: 1 }}>
        <Container maxWidth="xl">
          <Outlet />
        </Container>
      </Box>
    </Stack>
  );
};
