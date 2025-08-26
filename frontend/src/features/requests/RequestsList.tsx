import { Chip, Pagination, Paper, Stack, Typography } from '@mui/material';
import { useNavigate, useParams } from '@tanstack/react-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { TARequest } from '../../api/dashboard/types';
import { formatDatetime } from '../../utils/utils';
import { useRequestsContext } from './RequestsContext';

interface RequestsListProps {
  requests: TARequest[];
}

export const RequestsList: React.FC<RequestsListProps> = ({ requests }) => {
  const navigate = useNavigate();
  const { sortedRequests, sortField, setSortedRequests } = useRequestsContext();
  const params = useParams({ strict: false });
  const isSelected = (request: TARequest) => params.requestId === request.id.toString();
  const [page, setPage] = useState(1);
  const itemsPerPage = 2;
  const pageCount = Math.ceil(sortedRequests.length / itemsPerPage);
  const paginatedRequests = useMemo(() => {
    return sortedRequests.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  }, [page, sortedRequests]);

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const sortRequests = useCallback(() => {
    const sortDirection = sortField.startsWith('-') ? 'desc' : 'asc';
    const sortFieldName = sortField.replace('-', '') as keyof TARequest;
    requests.sort((a, b) => {
      if (a[sortFieldName]! < b[sortFieldName]!) {
        return sortDirection === 'asc' ? -1 : 1;
      }
      if (a[sortFieldName]! > b[sortFieldName]!) {
        return sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
    setSortedRequests([...requests]);
  }, [sortField, requests, setSortedRequests]);

  const handleItemClick = (request: TARequest) => {
    navigate({
      to: `/dashboard/requests/${request.id}`,
    });
  };

  // Ensure the correct page is selected based on the position
  // of the selected request in the sortedRequests array
  useEffect(() => {
    const requestIndex = sortedRequests.findIndex((r) => r.id.toString() === params.requestId);
    if (requestIndex !== -1) {
      const newPage = Math.floor(requestIndex / itemsPerPage) + 1;
      setPage(newPage);
    } else {
      setPage(1);
    }
  }, [params.requestId, sortedRequests]);

  useEffect(() => {
    if (sortField) {
      sortRequests();
    }
  }, [sortField, requests]);

  // If there are no requests, redirect to the requests page
  // This occurs if a request is assigned or removed and
  // it's the only request in the list.
  useEffect(() => {
    if (requests.length === 0) {
      navigate({
        to: `/dashboard/requests`,
      });
    }
  }, [requests]);

  return (
    <Stack spacing={1}>
      {paginatedRequests.map((request) => (
        <Paper
          key={request.id}
          onClick={() => handleItemClick(request)}
          sx={{
            backgroundColor: isSelected(request) ? 'primary.light' : 'white',
            border: isSelected(request) ? '2px solid' : 'none',
            cursor: 'pointer',
            paddingBottom: 1,
            paddingLeft: 2,
            paddingRight: 2,
            paddingTop: 1,
            transition: 'background-color 0.5s',
            '&:hover': {
              backgroundColor: isSelected(request) ? 'primary.light' : 'grey.100',
            },
          }}
        >
          <Stack spacing={1}>
            <Stack direction="row">
              <Typography component="h4" fontWeight="bold" sx={{ flexGrow: 1 }}>
                {request.customer_name}
              </Typography>
              <Typography>#{request.id}</Typography>
            </Stack>
            <Stack direction="row" alignItems="center">
              <Chip label={request.status} />
              <Typography variant="body2">{request.depth}</Typography>
              <Typography variant="body2" sx={{ flexGrow: 1, textAlign: 'right' }}>
                {formatDatetime(request.date_created)}
              </Typography>
            </Stack>
          </Stack>
        </Paper>
      ))}
      {sortedRequests.length === 0 && (
        <Typography variant="body1">No requests found in this category.</Typography>
      )}
      <Pagination
        count={pageCount}
        page={page}
        onChange={handlePageChange}
        variant="outlined"
        color="primary"
      />
    </Stack>
  );
};
