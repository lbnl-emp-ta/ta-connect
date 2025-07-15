import {
  DataGrid,
  GridRowSelectionModel,
  gridSortedRowEntriesSelector,
  useGridApiRef,
} from '@mui/x-data-grid';
import { useNavigate, useParams } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { TARequest } from '../../api/dashboard/types';
import { useRequestsContext } from './RequestsContext';

interface RequestsTableProps {
  data: TARequest[];
}

export const RequestsTable: React.FC<RequestsTableProps> = ({ data }) => {
  const navigate = useNavigate();
  const { setSortedRequests } = useRequestsContext();
  const params = useParams({ strict: false });
  const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>();
  const apiRef = useGridApiRef();

  const handleRowSelectionModelChange = (newSelection: GridRowSelectionModel) => {
    if (newSelection.ids.size > 0) {
      const selectedId = newSelection.ids.values().next().value;
      void navigate({
        to: `/dashboard/requests/${selectedId}`,
      });
    } else {
      void navigate({
        to: `/dashboard/requests`,
      });
    }
    setRowSelectionModel(newSelection);
  };

  const handleSortChange = () => {
    // The sort model changes before the rows are set,
    // so this forces a delay to ensure the rows are sorted
    setTimeout(() => {
      const sortedRowEntries = gridSortedRowEntriesSelector(apiRef);
      setSortedRequests(sortedRowEntries.map((row) => row.model as TARequest));
    }, 500);
  };

  useEffect(() => {
    if (data) {
      setSortedRequests(data);
    }
  }, [setSortedRequests, data]);

  /**
   * If a request ID is in the URL params,
   * set that request as selected in the table.
   */
  useEffect(() => {
    if (params.requestId) {
      setRowSelectionModel({
        type: 'include',
        ids: new Set<string | number>([params.requestId ? parseInt(params.requestId) : '']),
      });
    }
  }, [params.requestId]);

  return (
    <DataGrid
      apiRef={apiRef}
      rows={data || []}
      columns={[
        { field: 'id', headerName: 'ID', width: 90, align: 'center' },
        {
          field: 'status',
          headerName: 'Status',
          width: 150,
        },
        {
          field: 'depth',
          headerName: 'Depth',
          width: 150,
        },
        {
          field: 'customer_name',
          headerName: 'Customer Name',
          width: 200,
        },
        {
          field: 'customer_email',
          headerName: 'Customer Email',
          width: 200,
        },
        {
          field: 'assignedExpert',
          headerName: 'Assigned Expert',
          width: 200,
        },
      ]}
      onRowSelectionModelChange={handleRowSelectionModelChange}
      rowSelectionModel={rowSelectionModel}
      onSortModelChange={handleSortChange}
    />
  );
};
