import { DataGrid } from '@mui/x-data-grid';
import { TAAuditHistoryItem } from '../../api/dashboard/types';
import { formatDatetime } from '../../utils/utils';
import { Box, Tooltip } from '@mui/material';

interface RequestAuditHistoryProps {
  auditHistoryItems?: TAAuditHistoryItem[] | null;
}

export const RequestAuditHistory: React.FC<RequestAuditHistoryProps> = ({ auditHistoryItems }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <DataGrid
        rows={auditHistoryItems || []}
        columns={[
          { field: 'action_type', headerName: 'Action', flex: 1, minWidth: 150 },
          {
            field: 'description',
            headerName: 'Description',
            flex: 2,
            minWidth: 300,
            renderCell: (params) => {
              return (
                <Tooltip title={params.row.description} placement="top">
                  <span>{params.value}</span>
                </Tooltip>
              );
            },
          },
          {
            field: 'date',
            headerName: 'Date',
            flex: 1,
            minWidth: 200,
            valueFormatter: (value) => formatDatetime(value),
          },
          { field: 'user', headerName: 'User', flex: 1, minWidth: 150 },
        ]}
        getRowId={(row) => `${row.date}-${row.user}-${row.action_type}`}
        disableRowSelectionOnClick
        pageSizeOptions={[5, 10, 25]}
        initialState={{
          pagination: { paginationModel: { pageSize: 5 } },
        }}
        sx={{ backgroundColor: 'white' }}
      />
    </Box>
  );
};
