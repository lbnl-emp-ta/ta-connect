import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from '@mui/material';
import { CustomerRequestRelationship } from '../../api/dashboard/types';

interface RequestInfoTableProps {
  request?: CustomerRequestRelationship;
}

export const RequestInfoTable: React.FC<RequestInfoTableProps> = ({
  request,
}) => {
  return (
    <TableContainer
      sx={{
        height: 'stretch',
        width: 'stretch',
        borderWidth: 10,
        borderStyle: 'solid',
        borderColor: 'primary.main',
        borderRadius: 0,
        borderTopLeftRadius: 5,
        borderTopRightRadius: 5,
      }}
    >
      <Table>
        <TableHead>
          <TableRow
            sx={{
              bgcolor: 'primary.main',
              display: 'flex',
              justifyContent: 'center',
              textAlign: 'center',
              paddingBottom: 1,
            }}
          >
            Request Information
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell align="center" component="th" scope="row">
              {request?.id}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
};
