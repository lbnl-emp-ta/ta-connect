import {
  TableContainer,
  Table,
  TableRow,
  TableBody,
  TableCell,
  Typography,
  Stack,
  Box,
} from '@mui/material';
import { TARequestDetail } from '../../api/dashboard/types';
import { capitalize, formatDate } from '../../utils/utils';
import { InfoPanel } from '../../components/InfoPanel';

interface RequestInfoPanelProps {
  request?: TARequestDetail;
}

export const RequestInfoPanel: React.FC<RequestInfoPanelProps> = ({ request }) => {
  return (
    <InfoPanel header="Request Information">
      {!request && (
        <Box>
          <Typography>No request data to show.</Typography>
        </Box>
      )}
      {request && (
        <>
          <TableContainer>
            <Table size="small">
              <TableBody>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>{request.id}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Assignment Location</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <span>
                        {request.owner.domain_type
                          ? capitalize(request.owner.domain_type)
                          : 'Unknown'}
                      </span>
                      <span>|</span>
                      <span>{request.owner.program ? request.owner.program : 'Unknown'}</span>
                    </Stack>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Status</TableCell>
                  <TableCell>{request.status || 'Unknown'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Depth</TableCell>
                  <TableCell>{request.depth || 'Unknown'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Date Submitted</TableCell>
                  <TableCell>
                    {request.date_created ? formatDate(request.date_created) : 'Unknown'}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Project Start Date</TableCell>
                  <TableCell>
                    {request.proj_start_date ? formatDate(request.proj_start_date) : 'Unknown'}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Project Completion Date</TableCell>
                  <TableCell>
                    {request.proj_end_date ? formatDate(request.proj_end_date) : 'Unknown'}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Actual Completion Date</TableCell>
                  <TableCell>
                    {request.actual_completion_date
                      ? formatDate(request.actual_completion_date)
                      : 'Unknown'}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Topics</TableCell>
                  {/* TODO: Implement topics in the API and display */}
                  <TableCell>Unknown</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
          <Stack sx={{ padding: 2 }}>
            <Typography fontSize="0.875rem">Description</Typography>
            <Typography fontSize="0.875rem">
              {request.description || 'No description for this request.'}
            </Typography>
          </Stack>
        </>
      )}
    </InfoPanel>
  );
};
