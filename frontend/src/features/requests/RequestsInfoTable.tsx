import { TableContainer, Table, TableHead, TableRow } from '@mui/material';
import COLORS from '../../styles/colors';

export const RequestInfoTable: React.FC = () => {
  return (
    <TableContainer
      sx={{
        height: 'stretch',
        width: 'stretch',
        borderWidth: 10,
        borderStyle: 'solid',
        borderColor: COLORS.lblGreen,
        borderRadius: 0,
        borderTopLeftRadius: 5,
        borderTopRightRadius: 5,
      }}
    >
      <Table>
        <TableHead>
          <TableRow
            sx={{
              bgcolor: COLORS.lblGreen,
              display: 'flex',
              justifyContent: 'center',
              textAlign: 'center',
              paddingBottom: 1,
            }}
          >
            Request Information
          </TableRow>
        </TableHead>
      </Table>
    </TableContainer>
  );
};
