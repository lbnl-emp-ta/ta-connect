import {
  Chip,
  CircularProgress,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import { TARequestDetail } from '../../api/dashboard/types';
import { InfoPanel } from '../../components/InfoPanel';
import { capitalize, formatDate } from '../../utils/utils';
import { useEffect, useState } from 'react';
import { useIdentityContext } from '../identity/IdentityContext';
import { useRequestMutation } from '../../utils/queryOptions';

interface RequestInfoPanelProps {
  request?: TARequestDetail;
}

export const RequestInfoPanel: React.FC<RequestInfoPanelProps> = ({ request }) => {
  const { identity } = useIdentityContext();
  const updateRequestMutation = useRequestMutation(request?.id.toString() || '', identity);
  const [editing, setEditing] = useState(false);
  const [description, setDescription] = useState('');
  const [topics, setTopics] = useState<TARequestDetail['topics']>([]);

  const handleEditClick = () => {
    setEditing(true);
  };

  const handleDescriptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDescription(event.target.value);
  };

  const handleDescriptionSubmit = () => {
    updateRequestMutation.mutate({ description });
  };

  const handleDescriptionCancel = () => {
    updateRequestMutation.reset();
    setDescription(request?.description || '');
    setEditing(false);
  };

  useEffect(() => {
    if (request) {
      setTopics(request.topics || []);
      setDescription(request.description || '');
    }
  }, [request]);

  useEffect(() => {
    if (updateRequestMutation.isSuccess) {
      setEditing(false);
    }
  }, [updateRequestMutation.isSuccess]);

  return (
    <InfoPanel
      header={
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" component="h3">
            Request Details
          </Typography>
          {!editing && (
            <IconButton color="info" onClick={handleEditClick}>
              <EditIcon />
            </IconButton>
          )}
          {editing && (
            <Stack direction="row">
              {!updateRequestMutation.isPending && (
                <IconButton color="info" onClick={handleDescriptionSubmit}>
                  <CheckIcon />
                </IconButton>
              )}
              {updateRequestMutation.isPending && <CircularProgress />}
              <IconButton color="info" onClick={handleDescriptionCancel}>
                <ClearIcon />
              </IconButton>
            </Stack>
          )}
        </Stack>
      }
    >
      {!request && <Typography>No request data to show.</Typography>}
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
                  <TableCell>
                    <Chip
                      label={request.status ? request.status : 'Unknown'}
                      color="primary"
                      variant="outlined"
                    />
                  </TableCell>
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
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography fontSize="0.875rem">Description</Typography>
            </Stack>
            {!editing && (
              <Typography fontSize="0.875rem">
                {request.description || 'No description for this request.'}
              </Typography>
            )}
            {editing && (
              <TextField
                fullWidth
                multiline
                variant="outlined"
                value={description}
                onChange={handleDescriptionChange}
              />
            )}
          </Stack>
        </>
      )}
    </InfoPanel>
  );
};
