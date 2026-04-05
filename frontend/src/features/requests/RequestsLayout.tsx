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
  TextField,
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
  const { tab, sortField, setSortField, searchTerm, setSearchTerm } = useRequestsContext();

  const handleChangeSearchTerm = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

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
                    fontSize: '1rem',
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
                    fontSize: '1rem',
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
            <Stack direction="row" spacing={2} alignItems="center">
              <TextField
                value={searchTerm}
                label="Search"
                type="search"
                variant="outlined"
                size="small"
                fullWidth
                onChange={handleChangeSearchTerm}
              />
              <Select
                value={sortField}
                size="small"
                startAdornment={
                  <InputAdornment position="start">
                    <SortIcon />
                  </InputAdornment>
                }
                onChange={(e) => setSortField(e.target.value)}
                sx={{ width: 163, flexShrink: 0, flexGrow: 0 }}
              >
                <MenuItem value="-date_created">Newest first</MenuItem>
                <MenuItem value="date_created">Oldest first</MenuItem>
                <MenuItem value="status">Status</MenuItem>
              </Select>
            </Stack>
            {requestLists.map((list) => {
              if (list.requests) {
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
