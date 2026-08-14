import { TARequest } from '@/api/dashboard/types';
import { programsQueryOptions } from '@/api/queryOptions';
import { useRequestsContext } from '@/features/requests/RequestsContext';
import { RequestsList } from '@/features/requests/RequestsList';
import { a11yProps } from '@/utils/utils';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import SortIcon from '@mui/icons-material/Sort';
import {
  Box,
  Button,
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
import { useSuspenseQuery } from '@tanstack/react-query';
import { Outlet, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';

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
  const { data: allPrograms } = useSuspenseQuery(programsQueryOptions());
  const {
    tab,
    sortField,
    setSortField,
    searchTerm,
    setSearchTerm,
    programFilter,
    setProgramFilter,
  } = useRequestsContext();
  const [showSearchBox, setShowSearchBox] = useState(false);

  const handleToggleSearchBox = () => {
    setShowSearchBox(!showSearchBox);
  };

  const handleChangeSearchTerm = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  return (
    <Stack direction="row" spacing={0} sx={{ height: '100%' }}>
      <Box
        component="aside"
        sx={{
          backgroundColor: 'background.paper',
          borderRight: 1,
          borderColor: 'grey.100',
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
            <Stack direction="row" spacing={1} alignItems="center">
              <Button
                variant="outlined"
                onClick={handleToggleSearchBox}
                sx={{
                  height: 40,
                  width: 40,
                  minWidth: 40,
                  borderRadius: 10,
                  backgroundColor: searchTerm ? 'primary.light' : 'transparent',
                }}
              >
                {showSearchBox ? <ArrowBackIcon /> : <SearchIcon />}
              </Button>
              {showSearchBox && (
                <TextField
                  value={searchTerm}
                  label="Search"
                  type="search"
                  variant="outlined"
                  size="small"
                  fullWidth
                  onChange={handleChangeSearchTerm}
                />
              )}
              {!showSearchBox && (
                <>
                  <Select
                    value={programFilter || ''}
                    size="small"
                    startAdornment={<InputAdornment position="start">Program</InputAdornment>}
                    onChange={(e) => setProgramFilter(e.target.value)}
                    sx={{ flexGrow: 1 }}
                  >
                    <MenuItem value="">All Programs</MenuItem>
                    {allPrograms?.map((program) => (
                      <MenuItem key={program.id} value={program.id}>
                        {program.name}
                      </MenuItem>
                    ))}
                  </Select>
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
                </>
              )}
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
