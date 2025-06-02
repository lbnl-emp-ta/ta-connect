import { Box, Tab, Tabs } from '@mui/material';
import { DataGrid, GridEventListener } from '@mui/x-data-grid';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { CustomerRequestRelationship } from '../../api/dashboard/types';
import { TabPanel } from '../../components/TabPanel';
import { dateDiffInDays } from '../../utils/datetimes';
import { customerRequestRelationshipOptions } from '../../utils/queryOptions';
import { a11yProps } from '../../utils/utils';

interface RequestTableProps {
  setSelectedRequest: (request: CustomerRequestRelationship) => void;
}

export const RequestTable: React.FC<RequestTableProps> = ({
  setSelectedRequest,
}) => {
  const { data } = useSuspenseQuery(customerRequestRelationshipOptions());
  const tableData = data.map((crr) => {
    const ageInDays = dateDiffInDays(
      new Date(crr.request.date_created),
      new Date()
    );
    return { ...crr, age: ageInDays };
  });
  const [tabValue, setTabValue] = useState<string | number>(
    'actionable-requests'
  );

  const handleChangeTab = (
    _event: React.SyntheticEvent,
    newValue: string | number
  ) => {
    setTabValue(newValue);
  };

  const handleRowClick: GridEventListener<'rowClick'> = (params) => {
    setSelectedRequest(params.row as CustomerRequestRelationship);
  };

  return (
    <Box>
      <Tabs
        value={tabValue}
        onChange={handleChangeTab}
        aria-label="requests tabs"
      >
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
          onRowClick={handleRowClick}
        />
      </TabPanel>
      <TabPanel value={tabValue} index="downstream-requests">
        Downstream
      </TabPanel>
    </Box>
  );
};
