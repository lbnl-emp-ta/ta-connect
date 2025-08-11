import CheckIcon from '@mui/icons-material/Check';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ClearIcon from '@mui/icons-material/Clear';
import EditIcon from '@mui/icons-material/Edit';
import ErrorIcon from '@mui/icons-material/Error';
import {
  Autocomplete,
  Chip,
  CircularProgress,
  Grid,
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
import { DatePicker } from '@mui/x-date-pickers';
import { PickerValue } from '@mui/x-date-pickers/internals';
import dayjs, { Dayjs } from 'dayjs';
import { useCallback, useEffect, useState } from 'react';
import { TARequest, TARequestDetail, TATopic } from '../../api/dashboard/types';
import { InfoPanel } from '../../components/InfoPanel';
import { topicsQueryOptions, useRequestMutation } from '../../utils/queryOptions';
import { capitalize, formatDatetime } from '../../utils/utils';
import { useIdentityContext } from '../identity/IdentityContext';
import { useToastContext } from '../toasts/ToastContext';
import { ToastMessage } from '../toasts/ToastMessage';
import { useSuspenseQuery } from '@tanstack/react-query';

interface RequestInfoPanelProps {
  request?: TARequestDetail;
}

export const RequestInfoPanel: React.FC<RequestInfoPanelProps> = ({ request }) => {
  const { identity } = useIdentityContext();
  const updateRequestMutation = useRequestMutation(request?.id.toString() || '', identity);
  const { data: allTopics } = useSuspenseQuery(topicsQueryOptions());
  const [editing, setEditing] = useState(false);
  const { setShowToast, setToastMessage } = useToastContext();
  const [depth, setDepth] = useState<TARequestDetail['depth']>();
  const [projectedStartDate, setProjectedStartDate] = useState<Dayjs>();
  const [projectedCompletionDate, setProjectedCompletionDate] = useState<Dayjs>();
  const [actualCompletionDate, setActualCompletionDate] = useState<Dayjs>();
  const [description, setDescription] = useState('');
  const [topics, setTopics] = useState<TARequestDetail['topics']>([]);

  /**
   * Reset form values based on request data.
   */
  const resetFormValues = useCallback(() => {
    if (request) {
      setDepth(request.depth);

      setProjectedStartDate(request.proj_start_date ? dayjs(request.proj_start_date) : undefined);

      setProjectedCompletionDate(
        request.proj_completion_date ? dayjs(request.proj_completion_date) : undefined
      );

      setActualCompletionDate(
        request.actual_completion_date ? dayjs(request.actual_completion_date) : undefined
      );

      setTopics(request.topics || []);
      setDescription(request.description || '');
    }
  }, [request]);

  const handleEditClick = () => {
    setEditing(true);
  };

  /**
   * Handle submission of edited request information.
   * Only send fields that have changed to the API.
   * If a field is set explicitly to null, it will be cleared in the API.
   */
  const handleEditSubmit = () => {
    const mutationData = {} as Partial<TARequest>;
    if (depth !== request?.depth) {
      mutationData.depth = depth;
    }
    if (description !== request?.description) {
      mutationData.description = description;
    }
    if (projectedStartDate === null && request?.proj_start_date !== null) {
      mutationData.proj_start_date = null;
    }
    if (
      projectedStartDate &&
      projectedStartDate.format('YYYY-MM-DD') !== request?.proj_start_date
    ) {
      mutationData.proj_start_date = projectedStartDate.format('YYYY-MM-DD');
    }
    if (projectedCompletionDate === null && request?.proj_completion_date !== null) {
      mutationData.proj_completion_date = null;
    }
    if (
      projectedCompletionDate &&
      projectedCompletionDate.format('YYYY-MM-DD') !== request?.proj_completion_date
    ) {
      mutationData.proj_completion_date = projectedCompletionDate.format('YYYY-MM-DD');
    }
    if (actualCompletionDate === null && request?.actual_completion_date !== null) {
      mutationData.actual_completion_date = null;
    }
    if (
      actualCompletionDate &&
      actualCompletionDate.format('YYYY-MM-DD') !== request?.actual_completion_date
    ) {
      mutationData.actual_completion_date = actualCompletionDate.format('YYYY-MM-DD');
    }
    // Always send topics, even if they are unchanged
    // We could add a special function to check if topics have changed
    mutationData.topics = topics.map((topic) => topic.name);
    if (Object.keys(mutationData).length === 0) {
      setEditing(false);
      return;
    }
    console.log('Submitting request update:', mutationData);
    updateRequestMutation.mutate(mutationData);
  };

  const handleEditCancel = () => {
    updateRequestMutation.reset();
    resetFormValues();
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

  const handleTopicsChange = (_event: React.SyntheticEvent, newValue: TATopic[]) => {
    setTopics(newValue);
  };

  useEffect(() => {
    resetFormValues();
  }, [request, resetFormValues]);

  useEffect(() => {
    if (updateRequestMutation.isSuccess) {
      setEditing(false);
      setShowToast(true);
      setToastMessage(
        <ToastMessage icon={<CheckCircleIcon />}>Request information saved</ToastMessage>
      );
    } else if (updateRequestMutation.isError) {
      setShowToast(true);
      setToastMessage(
        <ToastMessage icon={<ErrorIcon />}>{updateRequestMutation.error.message}</ToastMessage>
      );
    }
  }, [
    updateRequestMutation.isSuccess,
    updateRequestMutation.isError,
    updateRequestMutation.error?.message,
  ]);

  return (
    <InfoPanel
      header={
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <span>Request Details</span>
          {!editing && (
            <IconButton onClick={handleEditClick}>
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
                      {request.owner && <span>{capitalize(request.owner.domain_type)}</span>}
                      {request.owner && request.owner.domain_type !== 'reception' && (
                        <>
                          <span>|</span>
                          <span>{request.owner.domain_name}</span>
                        </>
                      )}
                      {!request.owner && <span>None</span>}
                    </Stack>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Assigned Expert</TableCell>
                  <TableCell>{request.expert ? request.expert.email : 'None'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Status</TableCell>
                  <TableCell>
                    <Chip label={request.status ? request.status : 'Unknown'} color="primary" />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Depth</TableCell>
                  <TableCell>
                    {!editing && <>{request.depth || 'Unknown'}</>}
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
                    {request.date_created ? formatDatetime(request.date_created) : 'Unknown'}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Projected Start Date</TableCell>
                  <TableCell>
                    {!editing && (
                      <>
                        {request.proj_start_date
                          ? dayjs(request.proj_start_date).format('MM/DD/YYYY')
                          : 'Unknown'}
                      </>
                    )}
                    {editing && (
                      <DatePicker
                        value={projectedStartDate || null}
                        onChange={handleProjectedStartDateChange}
                        slotProps={{
                          field: {
                            clearable: true,
                          },
                        }}
                      />
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Projected Completion Date</TableCell>
                  <TableCell>
                    {!editing && (
                      <>
                        {request.proj_completion_date
                          ? dayjs(request.proj_completion_date).format('MM/DD/YYYY')
                          : 'Unknown'}
                      </>
                    )}
                    {editing && (
                      <DatePicker
                        value={projectedCompletionDate || null}
                        onChange={handleProjectedCompletionDateChange}
                        slotProps={{
                          field: {
                            clearable: true,
                          },
                        }}
                      />
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Actual Completion Date</TableCell>
                  <TableCell>
                    {!editing && (
                      <>
                        {request.actual_completion_date
                          ? dayjs(request.actual_completion_date).format('MM/DD/YYYY')
                          : 'Unknown'}
                      </>
                    )}
                    {editing && (
                      <DatePicker
                        value={actualCompletionDate || null}
                        onChange={handleActualCompletionDateChange}
                        slotProps={{
                          field: {
                            clearable: true,
                          },
                        }}
                      />
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Topics</TableCell>
                  <TableCell>
                    {!editing && (
                      <Grid container spacing={1}>
                        {request.topics && request.topics.length > 0 ? (
                          request.topics.map((topic) => (
                            <Grid key={topic.id} size="auto">
                              <Chip
                                key={topic.name}
                                label={topic.name}
                                color="default"
                                size="small"
                              />
                            </Grid>
                          ))
                        ) : (
                          <span>None</span>
                        )}
                      </Grid>
                    )}
                    {editing && (
                      <Autocomplete
                        multiple
                        options={allTopics || []}
                        getOptionLabel={(option) => option.name}
                        value={topics || []}
                        onChange={handleTopicsChange}
                        renderInput={(params) => (
                          <TextField {...params} variant="outlined" label="Topics" />
                        )}
                        disableCloseOnSelect
                      />
                    )}
                  </TableCell>
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
