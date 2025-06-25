import { TableRow, TableCell } from '@mui/material';
import { CustomerRequestRelationship } from '../../api/dashboard/types';

interface RequestTableRowProps {
  row: CustomerRequestRelationship & { age: number };
}
export const RequestTableRow: React.FC<RequestTableRowProps> = ({ row }) => {
  // const [open, setOpen] = useState(false);

  return (
    <>
      <TableRow>
        {/* <TableCell>
                    <IconButton
                        aria-label="expand row"
                        size="small"
                        onClick={() => setOpen(!open)}
                    >
                        {open ? <KeyboardArrowUp/> : <KeyboardArrowDown/>}
                    </IconButton>
                </TableCell> */}
        <TableCell align="center" component="th" scope="row">
          {row.id}
        </TableCell>
        <TableCell align="center">{row.age}</TableCell>
        <TableCell align="right">{row.request.status}</TableCell>
        <TableCell align="right">{row.request.depth}</TableCell>
        <TableCell align="right">{row.customer.name}</TableCell>
        <TableCell align="right">{row.customer.email}</TableCell>
        <TableCell align="right">N/A</TableCell>
      </TableRow>
      {/* <TableRow>
                <TableCell style={{paddingBottom: 0, paddingTop: 0}} colSpan={8}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{margin: 1}}>
                            <Typography variant='h6' gutterBottom component="div">
                                Additional Information 
                            </Typography>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Description</TableCell>
                                        <TableCell>Projected Start Date</TableCell>
                                        <TableCell>Projected Completion Date</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    <TableRow>
                                        <TableCell>{row.request.description}</TableCell>
                                        <TableCell>{row.request.proj_start_date || "Undetermined"}</TableCell>
                                        <TableCell>{row.request.proj_end_date || "Undetermined"}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow> */}
    </>
  );
};
