import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckIcon from '@mui/icons-material/Check';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CircleIcon from '@mui/icons-material/Circle';
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
import { useSuspenseQuery } from '@tanstack/react-query';
import dayjs, { Dayjs } from 'dayjs';
import { useCallback, useEffect, useState } from 'react';
import { TARequestDetail, TARequestDetailMutation, TATopic } from '@/api/dashboard/types';
import { identitiesQueryOptions, topicsQueryOptions, useRequestMutation } from '@/api/queryOptions';
import { InfoPanel } from '@/components/InfoPanel';
import { capitalize, effortOptions, formatDatetime, hasPermission, statusMap } from '@/utils/utils';
import { useAdminModeContext } from '@/features/admin-mode/AdminModeContext';
import { useToastContext } from '@/features/toasts/ToastContext';
import { ToastMessage } from '@/features/toasts/ToastMessage';
import { EffortIcon } from '@/components/EffortIcon';

interface RequestInfoPanelProps {
  request?: TARequestDetail;
}

export const RequestInfoPanel: React.FC<RequestInfoPanelProps> = ({ request }) => {
  const { isAdminMode } = useAdminModeContext();
  const updateRequestMutation = useRequestMutation(request?.id.toString() || '', isAdminMode);
  const { data: identities } = useSuspenseQuery(identitiesQueryOptions());
  const { data: allTopics } = useSuspenseQuery(topicsQueryOptions());
  const [editing, setEditing] = useState(false);
  const { setShowToast, setToastMessage } = useToastContext();
  const [depth, setDepth] = useState<TARequestDetail['depth']>();
  const [effort, setEffort] = useState<TARequestDetail['effort']>();
  const [projectedStartDate, setProjectedStartDate] = useState<Dayjs>();
  const [projectedCompletionDate, setProjectedCompletionDate] = useState<Dayjs>();
  const [actualCompletionDate, setActualCompletionDate] = useState<Dayjs>();
  const [topics, setTopics] = useState<TARequestDetail['topics']>([]);

  /**
   * Reset form values based on request data.
   */
  const resetFormValues = useCallback(() => {
    if (request) {
      setDepth(request.depth);
      setEffort(request.effort);
      setProjectedStartDate(request.proj_start_date ? dayjs(request.proj_start_date) : undefined);
      setProjectedCompletionDate(
        request.proj_completion_date ? dayjs(request.proj_completion_date) : undefined
      );
      setActualCompletionDate(
        request.actual_completion_date ? dayjs(request.actual_completion_date) : undefined
      );
      setTopics(request.topics || []);
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
    const mutationData = {} as Partial<TARequestDetailMutation>;
    if (depth !== request?.depth) {
      mutationData.depth = depth;
    }
    if (effort !== request?.effort) {
      mutationData.effort = effort;
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
    if (topics !== request?.topics) {
      mutationData.topics = topics.map((topic) => topic.name);
    }

    if (Object.keys(mutationData).length === 0) {
      setEditing(false);
      return;
    }
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

  const handleEffortChange = (event: SelectChangeEvent) => {
    setEffort(event.target.value);
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
          <Stack direction="row" spacing={2} alignItems="center">
            <AssignmentIcon color="primary" />
            <Typography variant="h5" component="h3" fontWeight="bold">
              Request Details
            </Typography>
          </Stack>
          {!editing && (
            <IconButton onClick={handleEditClick}>
              <EditIcon />
            </IconButton>
          )}
          {editing && (
            <Stack direction="row">
              {!updateRequestMutation.isPending && (
                <IconButton onClick={handleEditSubmit}>
                  <CheckIcon />
                </IconButton>
              )}
              {updateRequestMutation.isPending && <CircularProgress />}
              <IconButton onClick={handleEditCancel}>
                <ClearIcon />
              </IconButton>
            </Stack>
          )}
        </Stack>
      }
    >
      {!request && <Typography>No request data to show.</Typography>}
      {request && (
        <TableContainer>
          <Table
            size="small"
            sx={{
              '& .MuiTableCell-root:first-of-type': {
                color: 'grey.900',
                fontWeight: 'bold',
                width: '205px',
              },
            }}
          >
            <TableBody>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>{request.id}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Status</TableCell>
                <TableCell>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <CircleIcon
                      fontSize="small"
                      sx={{
                        color: statusMap[request.status].color,
                      }}
                    />
                    <span>{request.status ? statusMap[request.status].text : '-'}</span>
                  </Stack>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Current Owner</TableCell>
                <TableCell
                  sx={{
                    color: request.owner ? statusMap[request.status].color : 'grey.900',
                    fontWeight: 'bold',
                  }}
                >
                  <Stack direction="row" spacing={1}>
                    {request.owner && <span>{capitalize(request.owner.domain_type)}</span>}
                    {request.owner && request.owner.domain_type !== 'reception' && (
                      <>
                        <span>|</span>
                        <span>{request.owner.domain_name}</span>
                      </>
                    )}
                    {!request.owner && <span>-</span>}
                  </Stack>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Program</TableCell>
                <TableCell>{request.program ? request.program.name : '-'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Lab</TableCell>
                <TableCell>{request.lab ? request.lab.name : '-'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Assigned Expert</TableCell>
                <TableCell>{request.expert ? request.expert.email : '-'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Depth</TableCell>
                <TableCell>
                  {(!editing || !hasPermission('edit-depth', identities)) && (
                    <>{request.depth || '-'}</>
                  )}
                  {editing && hasPermission('edit-depth', identities) && (
                    <Select value={depth} onChange={handleDepthChange}>
                      {request.depth_options.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Effort</TableCell>
                <TableCell>
                  {(!editing || !hasPermission('edit-effort', identities)) && (
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <EffortIcon effort={request.effort || ''} fontSize="small" />
                      <span>{request.effort || '-'}</span>
                    </Stack>
                  )}
                  {editing && hasPermission('edit-effort', identities) && (
                    <Select value={effort} onChange={handleEffortChange}>
                      {effortOptions.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Date Submitted</TableCell>
                <TableCell>
                  {request.date_created ? formatDatetime(request.date_created) : '-'}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Projected Start Date</TableCell>
                <TableCell>
                  {(!editing || !hasPermission('edit-projected-start-date', identities)) && (
                    <>
                      {request.proj_start_date
                        ? dayjs(request.proj_start_date).format('MM/DD/YYYY')
                        : '-'}
                    </>
                  )}
                  {editing && hasPermission('edit-projected-start-date', identities) && (
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
                  {(!editing ||
                    !hasPermission(
                      'edit-projected-completion-date',
                      identities,
                      request.status
                    )) && (
                    <>
                      {request.proj_completion_date
                        ? dayjs(request.proj_completion_date).format('MM/DD/YYYY')
                        : '-'}
                    </>
                  )}
                  {editing &&
                    hasPermission('edit-projected-completion-date', identities, request.status) && (
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
                  {(!editing || !hasPermission('edit-actual-completion-date', identities)) && (
                    <>
                      {request.actual_completion_date
                        ? dayjs(request.actual_completion_date).format('MM/DD/YYYY')
                        : '-'}
                    </>
                  )}
                  {editing && hasPermission('edit-actual-completion-date', identities) && (
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
                  {(!editing || !hasPermission('edit-topics', identities)) && (
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
                  {editing && hasPermission('edit-topics', identities) && (
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
      )}
    </InfoPanel>
  );
};
