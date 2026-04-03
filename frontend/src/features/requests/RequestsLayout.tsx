import { TARequest } from '@/api/dashboard/types';
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

export interface RequestListConfig {
  id: string;
  heading?: string;
  requests: TARequest[] | null;
}

interface RequestsLayoutProps {
  requestLists: RequestListConfig[];
}

export const RequestsLayout: React.FC<RequestsLayoutProps> = ({ requestLists }) => {
  const navigate = useNavigate();
  // const { identity, detailedIdentity, setIdentity, setDetailedIdentity } = useIdentityContext();
  const { tab, sortField, setSortField } = useRequestsContext();

  // useEffect(() => {
  //   if (detailedIdentity && identity && detailedIdentity.role.id !== identity?.role) {
  //     setSortedRequests([]);
  //   }
  // }, [detailedIdentity, setDetailedIdentity, setIdentity]);

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
            {requestLists.map((list) => {
              if (list.requests) {
                console.log(list.heading, list.requests);
                return (
                  <RequestsList
                    key={list.id}
                    requests={list.requests}
                    listId={list.id}
                    heading={list.heading}
                    itemsPerPage={requestLists.length > 1 ? 5 : 10}
                  />
                );
              } else {
                return (
                  <Typography key={list.id} variant="body1">
                    Failed to load requests.
                  </Typography>
                );
              }
            })}
          </Stack>
        </Stack>
      </Box>
      <Box sx={{ flexGrow: 1 }}>
        <Container maxWidth="xl" sx={{ paddingTop: 3, paddingBottom: 3 }}>
          <Outlet />
        </Container>
      </Box>
    </Stack>
  );
};
