import {
  Chip,
  CircularProgress,
  IconButton,
  MenuItem,
  Select,
  SelectChangeEvent,
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
import { DatePicker } from '@mui/x-date-pickers';
import dayjs, { Dayjs } from 'dayjs';
import { PickerValue } from '@mui/x-date-pickers/internals';

interface RequestInfoPanelProps {
  request?: TARequestDetail;
}

export const RequestInfoPanel: React.FC<RequestInfoPanelProps> = ({ request }) => {
  const { identity } = useIdentityContext();
  const updateRequestMutation = useRequestMutation(request?.id.toString() || '', identity);
  const [editing, setEditing] = useState(false);
  const [depth, setDepth] = useState<TARequestDetail['depth']>();
  const [projectedStartDate, setProjectedStartDate] = useState<Dayjs>();
  const [projectedCompletionDate, setProjectedCompletionDate] = useState<Dayjs>();
  const [actualCompletionDate, setActualCompletionDate] = useState<Dayjs>();
  const [description, setDescription] = useState('');
  const [topics, setTopics] = useState<TARequestDetail['topics']>([]);

  const handleEditClick = () => {
    setEditing(true);
  };

  const handleEditSubmit = () => {
    updateRequestMutation.mutate({
      depth,
      // proj_start_date: projectedStartDate?.toISOString(),
      description,
    });
  };

  const handleEditCancel = () => {
    updateRequestMutation.reset();
    setDepth(request?.depth);
    setDescription(request?.description || '');
    setEditing(false);
  };

  const handleDepthChange = (event: SelectChangeEvent) => {
    setDepth(event.target.value);
  };

  const handleDescriptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDescription(event.target.value);
  };

  const handleProjectedStartDateChange = (value: PickerValue) => {
    setProjectedStartDate(value as Dayjs);
  };

  const handleProjectedCompletionDateChange = (value: PickerValue) => {
    setProjectedCompletionDate(value as Dayjs);
  };

  const handleActualCompletionDateChange = (value: PickerValue) => {
    setActualCompletionDate(value as Dayjs);
  };

  useEffect(() => {
    if (request) {
      setDepth(request.depth);
      setProjectedStartDate(dayjs(request.proj_start_date));
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
                <IconButton color="info" onClick={handleEditSubmit}>
                  <CheckIcon />
                </IconButton>
              )}
              {updateRequestMutation.isPending && <CircularProgress />}
              <IconButton color="info" onClick={handleEditCancel}>
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
                  <TableCell>
                    {!editing && <Typography>{request.depth || 'Unknown'}</Typography>}
                    {editing && (
                      <Select value={depth} onChange={handleDepthChange}>
                        <MenuItem value="Help Desk">Help Desk</MenuItem>
                        <MenuItem value="Expert Match">Expert Match</MenuItem>
                        <MenuItem value="Unsure">Unsure</MenuItem>
                      </Select>
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Date Submitted</TableCell>
                  <TableCell>
                    {request.date_created ? formatDate(request.date_created) : 'Unknown'}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Projected Start Date</TableCell>
                  <TableCell>
                    {!editing && (
                      <Typography>
                        {request.proj_start_date ? formatDate(request.proj_start_date) : 'Unknown'}
                      </Typography>
                    )}
                    {editing && (
                      <DatePicker
                        value={projectedStartDate}
                        onChange={handleProjectedStartDateChange}
                      />
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Projected Completion Date</TableCell>
                  <TableCell>
                    {!editing && (
                      <Typography>
                        {request.proj_completion_date
                          ? formatDate(request.proj_completion_date)
                          : 'Unknown'}
                      </Typography>
                    )}
                    {editing && (
                      <DatePicker
                        value={projectedCompletionDate}
                        onChange={handleProjectedCompletionDateChange}
                      />
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Actual Completion Date</TableCell>
                  <TableCell>
                    {!editing && (
                      <Typography>
                        {request.actual_completion_date
                          ? formatDate(request.actual_completion_date)
                          : 'Unknown'}
                      </Typography>
                    )}
                    {editing && (
                      <DatePicker
                        value={actualCompletionDate}
                        onChange={handleActualCompletionDateChange}
                      />
                    )}
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
