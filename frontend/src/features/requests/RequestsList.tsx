import { Chip, TablePagination, Paper, Stack, Typography } from '@mui/material';
import { useNavigate, useParams } from '@tanstack/react-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { TARequest } from '../../api/dashboard/types';
import { formatDatetime } from '../../utils/utils';
import { useRequestsContext } from './RequestsContext';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';
import TaskAltIcon from '@mui/icons-material/TaskAlt';

interface RequestsListProps {
  listId: string;
  heading?: string;
  requests: TARequest[];
  itemsPerPage?: number;
}

export const RequestsList: React.FC<RequestsListProps> = ({
  listId,
  heading,
  requests,
  itemsPerPage = 10,
}) => {
  const navigate = useNavigate();
  const {
    tab,
    sortedRequestsMap,
    sortField,
    setSortedRequestsForList,
    setCurrentIndex,
    setSelectedListId,
    searchTerm,
  } = useRequestsContext();
  const params = useParams({ strict: false });
  const sortedRequests = sortedRequestsMap[listId] ?? [];
  const isSelected = (request: TARequest) => params.requestId === request.id.toString();
  const [page, setPage] = useState(0);
  const paginatedRequests = useMemo(() => {
    return sortedRequests.slice(page * itemsPerPage, (page + 1) * itemsPerPage);
  }, [page, sortedRequests]);

  const handlePageChange = (
    _event: React.MouseEvent<HTMLButtonElement, MouseEvent> | null,
    value: number
  ) => {
    setPage(value);
  };

  const sortRequests = useCallback(() => {
    const sortDirection = sortField.startsWith('-') ? 'desc' : 'asc';
    const sortFieldName = sortField.replace('-', '') as keyof TARequest;
    const filtered = searchTerm
      ? requests.filter((r) =>
          `${JSON.stringify(r)}`.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : requests;
    const sorted = [...filtered].sort((a, b) => {
      if (a[sortFieldName]! < b[sortFieldName]!) return sortDirection === 'asc' ? -1 : 1;
      if (a[sortFieldName]! > b[sortFieldName]!) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    setSortedRequestsForList(listId, sorted);
  }, [sortField, searchTerm, requests, listId, setSortedRequestsForList]);

  const handleItemClick = (request: TARequest) => {
    navigate({
      to: `/requests/${tab}/${request.id}`,
    });
  };

  // Ensure the correct page is selected based on the position
  // of the selected request in the sortedRequests array
  useEffect(() => {
    const requestIndex = sortedRequests.findIndex((r) => r.id.toString() === params.requestId);
    if (requestIndex !== -1) {
      const newPage = Math.floor(requestIndex / itemsPerPage);
      setPage(newPage);
      setSelectedListId(listId);
      setCurrentIndex(requestIndex);
    } else {
      setPage(0);
    }
  }, [params.requestId, sortedRequests]);

  useEffect(() => {
    sortRequests();
  }, [sortField, requests, searchTerm, sortRequests]);

  // If there are no requests, redirect to the requests page
  // This occurs if a request is assigned or removed and
  // it's the only request in the list.
  useEffect(() => {
    if (requests.length === 0) {
      navigate({
        to: `/requests/${tab}`,
      });
    }
  }, [requests]);

  return (
    <Stack spacing={1}>
      {heading && (
        <Stack direction="row" spacing={1} alignItems="center">
          {listId === 'actionable' && <TaskAltIcon color="primary" />}
          {listId === 'downstream' && <HourglassBottomIcon color="primary" />}
          <Typography component="h3" variant="h6" fontWeight="bold">
            {heading}
          </Typography>
        </Stack>
      )}
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
                {request.customer_state_abbreviation} - {request.customer_name}
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
      <TablePagination
        component="div"
        rowsPerPage={itemsPerPage}
        rowsPerPageOptions={[]}
        count={sortedRequests.length}
        page={page}
        onPageChange={handlePageChange}
        showFirstButton
        showLastButton
      />
    </Stack>
  );
};
