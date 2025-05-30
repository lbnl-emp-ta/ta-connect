import {
  Button,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from '@mui/material';
import { useSuspenseQuery } from '@tanstack/react-query';
import COLORS from '../../styles/colors';
import { dateDiffInDays } from '../../utils/datetimes';
import { customerRequestRelationshipOptions } from '../../utils/queryOptions';
import { RequestTableRow } from './RequestsTableRow';

export const RequestTable: React.FC = () => {
  const { data: customerRequestRelationships } = useSuspenseQuery(
    customerRequestRelationshipOptions()
  );
  const tableData = customerRequestRelationships.map((crr) => {
    const ageInDays = dateDiffInDays(
      new Date(crr.request.date_created),
      new Date()
    );
    return { ...crr, age: ageInDays };
  });

  return (
    <>
      <Button
        disableRipple
        sx={{
          bgcolor: COLORS.lblGreen,
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
      <TableContainer
        component={Paper}
        sx={{
          borderWidth: 10,
          borderStyle: 'solid',
          borderColor: COLORS.lblGreen,
          borderRadius: 0,
        }}
      >
        <Table aria-label="table" size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: '#EFEFEF' }}>
              <TableCell align="center">ID</TableCell>
              <TableCell align="right">Age (in days)</TableCell>
              <TableCell align="right">Status</TableCell>
              <TableCell align="right">Depth</TableCell>
              <TableCell align="right">Customer Name</TableCell>
              <TableCell align="right">Customer Email</TableCell>
              <TableCell align="right">Assigned Expert</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tableData.map((row) => (
              <RequestTableRow key={row.id} row={row} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};
