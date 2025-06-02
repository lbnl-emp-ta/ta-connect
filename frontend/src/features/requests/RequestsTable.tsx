import { Box, Tab, Tabs } from '@mui/material';
import {
  DataGrid,
  GridRowSelectionModel,
  gridSortedRowEntriesSelector,
  useGridApiRef,
} from '@mui/x-data-grid';
import { useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { CustomerRequestRelationship } from '../../api/dashboard/types';
import { TabPanel } from '../../components/TabPanel';
import { dateDiffInDays } from '../../utils/datetimes';
import { a11yProps } from '../../utils/utils';
import { useRequestsContext } from './RequestsContext';
import { useSuspenseQuery } from '@tanstack/react-query';
import { customerRequestRelationshipOptions } from '../../utils/queryOptions';

export const RequestTable: React.FC = () => {
  const navigate = useNavigate();
  const { setSortedRequests } = useRequestsContext();
  const { data } = useSuspenseQuery(customerRequestRelationshipOptions());
  const tableData = data.map((crr) => {
    const ageInDays = dateDiffInDays(new Date(crr.request.date_created), new Date());
    return { ...crr, age: ageInDays };
  });
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
      setSortedRequests(sortedRowEntries.map((row) => row.model as CustomerRequestRelationship));
    }, 500);
  };

  useEffect(() => {
    setSortedRequests(data);
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
          rows={tableData}
          columns={[
            { field: 'id', headerName: 'ID', width: 90, align: 'center' },
            {
              field: 'age',
              headerName: 'Age (in days)',
              type: 'number',
              width: 150,
            },
            {
              field: 'request.status',
              valueGetter: (_value, row) => row.request.status,
              headerName: 'Status',
              width: 150,
            },
            {
              field: 'request.depth',
              valueGetter: (_value, row) => row.request.depth,
              headerName: 'Depth',
              width: 150,
            },
            {
              field: 'customer.name',
              valueGetter: (_value, row) => row.customer.name,
              headerName: 'Customer Name',
              width: 200,
            },
            {
              field: 'customer.email',
              valueGetter: (_value, row) => row.customer.email,
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
