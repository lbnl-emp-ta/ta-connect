import { Box, Button } from '@mui/material';
import { DataGrid, GridEventListener } from '@mui/x-data-grid';
import { useSuspenseQuery } from '@tanstack/react-query';
import { dateDiffInDays } from '../../utils/datetimes';
import { customerRequestRelationshipOptions } from '../../utils/queryOptions';
import { CustomerRequestRelationship } from '../../api/dashboard/types';

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

  const handleRowClick: GridEventListener<'rowClick'> = (params) => {
    setSelectedRequest(params.row as CustomerRequestRelationship);
  };

  return (
    <Box>
      <Button
        disableRipple
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          borderRadius: 0,
          paddingLeft: 5,
          paddingRight: 5,
          borderTopLeftRadius: 5,
          borderTopRightRadius: 5,
        }}
      >
        Actionable Requests
      </Button>
      <Button
        disableRipple
        sx={{
          bgcolor: '#274047',
          color: 'white',
          borderRadius: 0,
          paddingLeft: 5,
          paddingRight: 5,
          borderTopLeftRadius: 5,
          borderTopRightRadius: 5,
        }}
      >
        Downstream Requests
      </Button>
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
    </Box>
  );
};
