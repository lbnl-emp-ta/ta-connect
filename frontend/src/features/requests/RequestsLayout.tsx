import { TARequest } from '@/api/dashboard/types';
import { useIdentityContext } from '@/features/identity/IdentityContext';
import { useRequestsContext } from '@/features/requests/RequestsContext';
import { RequestsList } from '@/features/requests/RequestsList';
import { a11yProps } from '@/utils/utils';
import SortIcon from '@mui/icons-material/Sort';
import {
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
import { Outlet, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';

interface RequestsLayoutProps {
  requestsList: TARequest[] | null;
}

export const RequestsLayout: React.FC<RequestsLayoutProps> = ({ requestsList }) => {
  const navigate = useNavigate();
  const { identity, detailedIdentity, setIdentity, setDetailedIdentity } = useIdentityContext();
  const { tab, sortField, setSortField, setSortedRequests } = useRequestsContext();

  useEffect(() => {
    if (detailedIdentity && identity && detailedIdentity.role.id !== identity?.role) {
      setSortedRequests([]);
    }
  }, [detailedIdentity, setDetailedIdentity, setIdentity]);

  return (
    <Stack direction="row" spacing={0} sx={{ height: '100%' }}>
      <Box
        component="aside"
        sx={{
          backgroundColor: 'background.paper',
          height: '100%',
          flexBasis: 500,
          minWidth: 500,
        }}
      >
        {requestsList && (
          <Stack spacing={0}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs
                value={tab}
                variant="fullWidth"
                textColor="secondary"
                indicatorColor="secondary"
                aria-label="requests tabs"
              >
                <Tab
                  label="Active"
                  component="a"
                  onClick={() => navigate({ to: '/requests/active' })}
                  disableRipple
                  value="active"
                  sx={{
                    '&.MuiButtonBase-root': {
                      paddingLeft: 0,
                      paddingRight: 0,
                      textTransform: 'none',
                    },
                  }}
                  {...a11yProps('active')}
                />
                <Tab
                  label="Inactive"
                  component="a"
                  onClick={() => navigate({ to: '/requests/inactive' })}
                  disableRipple
                  value="inactive"
                  sx={{
                    '&.MuiButtonBase-root': {
                      paddingLeft: 0,
                      paddingRight: 0,
                      textTransform: 'none',
                    },
                  }}
                  {...a11yProps('inactive')}
                />
              </Tabs>
            </Box>
            <Stack sx={{ padding: 2 }}>
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
              <RequestsList requests={requestsList} />
            </Stack>
          </Stack>
        )}
        {!requestsList && <Typography variant="body1">Failed to load requests.</Typography>}
      </Box>
      <Box sx={{ flexGrow: 1 }}>
        <Container maxWidth="xl" sx={{ paddingTop: 3, paddingBottom: 3 }}>
          <Outlet />
        </Container>
      </Box>
    </Stack>
  );
};
