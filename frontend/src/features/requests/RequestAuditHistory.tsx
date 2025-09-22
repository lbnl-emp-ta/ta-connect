import { DataGrid } from '@mui/x-data-grid';
import { TAAuditHistoryItem } from '../../api/dashboard/types';
import { formatDatetime } from '../../utils/utils';

interface RequestAuditHistoryProps {
  auditHistoryItems?: TAAuditHistoryItem[] | null;
}

export const RequestAuditHistory: React.FC<RequestAuditHistoryProps> = ({ auditHistoryItems }) => {
  return (
    <DataGrid
      rows={auditHistoryItems || []}
      columns={[
        { field: 'action_type', headerName: 'Action', flex: 1, minWidth: 150 },
        {
          field: 'date',
          headerName: 'Date',
          flex: 1,
          minWidth: 200,
          valueFormatter: (value) => formatDatetime(value),
        },
        { field: 'user', headerName: 'User', flex: 1, minWidth: 150 },
        { field: 'role', headerName: 'Role', flex: 1, minWidth: 150 },
        { field: 'description', headerName: 'Description', flex: 2, minWidth: 300 },
      ]}
      getRowId={(row) => `${row.date}-${row.user}-${row.action_type}`}
      pageSizeOptions={[5, 10, 25]}
      initialState={{
        pagination: { paginationModel: { pageSize: 5 } },
      }}
      sx={{ backgroundColor: 'white' }}
    />
  );
};
