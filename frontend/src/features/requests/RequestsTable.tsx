import { Box, Tab, Tabs } from '@mui/material';
import {
  DataGrid,
  GridRowSelectionModel,
  gridSortedRowEntriesSelector,
  useGridApiRef,
} from '@mui/x-data-grid';
import { useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { TARequest } from '../../api/dashboard/types';
import { TabPanel } from '../../components/TabPanel';
import { a11yProps } from '../../utils/utils';
import { useRequestsContext } from './RequestsContext';
import { useSuspenseQuery } from '@tanstack/react-query';
import { requestsQueryOptions } from '../../utils/queryOptions';
import { useIdentityContext } from '../identity/IdentityContext';

export const RequestsTable: React.FC = () => {
  const navigate = useNavigate();
  const { setSortedRequests } = useRequestsContext();
  const { identity } = useIdentityContext();
  const { data } = useSuspenseQuery(requestsQueryOptions(identity));
  console.log('RequestTable data', data);
  const [tabValue, setTabValue] = useState<string | number>('actionable-requests');
  const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>({
    type: 'include',
    ids: new Set<string | number>(),
  });
  const apiRef = useGridApiRef();

  const handleChangeTab = (_event: React.SyntheticEvent, newValue: string | number) => {
    setTabValue(newValue);
  };

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

  return (
    <Box>
      <Tabs value={tabValue} onChange={handleChangeTab} aria-label="requests tabs">
        <Tab
          label="My Actionable Requests"
          value="actionable-requests"
          {...a11yProps('actionable-requests')}
        />
        <Tab
          label="Downstream Requests"
          value="downstream-requests"
          {...a11yProps('downstream-requests')}
        />
      </Tabs>
      <TabPanel value={tabValue} index="actionable-requests">
        <DataGrid
          apiRef={apiRef}
          rows={data || []}
          columns={[
            { field: 'id', headerName: 'ID', width: 90, align: 'center' },
            // {
            //   field: 'age',
            //   headerName: 'Age (in days)',
            //   type: 'number',
            //   width: 150,
            // },
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
      </TabPanel>
      <TabPanel value={tabValue} index="downstream-requests">
        Downstream
      </TabPanel>
    </Box>
  );
};
