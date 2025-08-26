import { Chip, Paper, Stack, Typography } from '@mui/material';
import { useNavigate, useParams } from '@tanstack/react-router';
import { useCallback, useEffect } from 'react';
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

  useEffect(() => {
    if (sortField) {
      sortRequests();
    }
  }, [sortField, requests]);

  useEffect(() => {
    if (requests) {
      setSortedRequests(requests);
      if (requests.length === 0) {
        void navigate({
          to: `/dashboard/requests`,
        });
      }
    }
  }, [setSortedRequests, requests]);

  return (
    <Stack spacing={1}>
      {sortedRequests.map((request) => (
        <Paper
          key={request.id}
          onClick={() => handleItemClick(request)}
          sx={{
            border: params.requestId === request.id.toString() ? '2px solid' : 'none',
            cursor: 'pointer',
            padding: 2,
            transition: 'background-color 0.5s',
            '&:hover': {
              backgroundColor: 'grey.100',
            },
          }}
        >
          <Stack direction="row">
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
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
        </Paper>
      ))}
      {sortedRequests.length === 0 && (
        <Typography variant="body1">No requests found in this category.</Typography>
      )}
    </Stack>
  );
};
