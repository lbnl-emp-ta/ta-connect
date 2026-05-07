import DescriptionIcon from '@mui/icons-material/Description';
import CheckIcon from '@mui/icons-material/Check';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ClearIcon from '@mui/icons-material/Clear';
import EditIcon from '@mui/icons-material/Edit';
import ErrorIcon from '@mui/icons-material/Error';
import { Box, CircularProgress, IconButton, Stack, TextField, Typography } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { TARequestDetail, TARequestDetailMutation } from '../../api/dashboard/types';
import { useRequestMutation } from '../../api/queryOptions';
import { InfoPanel } from '../../components/InfoPanel';
import { hasPermission } from '../../utils/utils';
import { useIdentityContext } from '../identity/IdentityContext';
import { useToastContext } from '../toasts/ToastContext';
import { ToastMessage } from '../toasts/ToastMessage';

interface RequestScopePanelProps {
  request?: TARequestDetail;
}

export const RequestScopePanel: React.FC<RequestScopePanelProps> = ({ request }) => {
  const { identity, detailedIdentity } = useIdentityContext();
  const updateRequestMutation = useRequestMutation(request?.id.toString() || '', identity);
  const [editing, setEditing] = useState(false);
  const { setShowToast, setToastMessage } = useToastContext();
  const [description, setDescription] = useState('');
  const [challenges, setChallenges] = useState<string>();
  const [goals, setGoals] = useState<string>();

  /**
   * Reset form values based on request data.
   */
  const resetFormValues = useCallback(() => {
    if (request) {
      setDescription(request.description);
      setChallenges(request.challenges);
      setGoals(request.goals);
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
    if (description !== request?.description) {
      mutationData.description = description;
    }
    if (challenges !== request?.challenges) {
      mutationData.challenges = challenges;
    }
    if (goals !== request?.goals) {
      mutationData.goals = goals;
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

  const handleDescriptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDescription(event.target.value);
  };

  const handleChallengesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChallenges(event.target.value);
  };

  const handleGoalsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setGoals(event.target.value);
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
            <DescriptionIcon color="primary" />
            <Typography variant="h5" component="h3" fontWeight="bold">
              Scope
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
        <Stack sx={{ padding: 2 }}>
          <Stack>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography fontSize="0.875rem" fontWeight="bold" color="grey.900">
                Description
              </Typography>
            </Stack>
            {(!editing || !hasPermission('edit-description', detailedIdentity)) && (
              <Box
                sx={{
                  backgroundColor: 'grey.50',
                  padding: 2,
                  borderRadius: 1,
                  borderLeft: '4px solid',
                  borderColor: 'grey.500',
                }}
              >
                <Typography fontSize="0.875rem">
                  {request.description || 'No description for this request.'}
                </Typography>
              </Box>
            )}
            {editing && hasPermission('edit-description', detailedIdentity) && (
              <TextField
                fullWidth
                multiline
                variant="outlined"
                value={description}
                onChange={handleDescriptionChange}
              />
            )}
          </Stack>
          <Stack>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography fontSize="0.875rem" fontWeight="bold" color="grey.900">
                Challenges
              </Typography>
            </Stack>
            {(!editing || !hasPermission('edit-challenges', detailedIdentity)) && (
              <Box
                sx={{
                  backgroundColor: 'grey.50',
                  padding: 2,
                  borderRadius: 1,
                  borderLeft: '4px solid',
                  borderColor: 'grey.500',
                }}
              >
                <Typography fontSize="0.875rem">{request.challenges || '-'}</Typography>
              </Box>
            )}
            {editing && hasPermission('edit-challenges', detailedIdentity) && (
              <TextField
                fullWidth
                multiline
                variant="outlined"
                value={challenges}
                onChange={handleChallengesChange}
              />
            )}
          </Stack>
          <Stack>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography fontSize="0.875rem" fontWeight="bold" color="grey.900">
                Goals
              </Typography>
            </Stack>
            {(!editing || !hasPermission('edit-goals', detailedIdentity)) && (
              <Box
                sx={{
                  backgroundColor: 'grey.50',
                  padding: 2,
                  borderRadius: 1,
                  borderLeft: '4px solid',
                  borderColor: 'grey.500',
                }}
              >
                <Typography fontSize="0.875rem">{request.goals || '-'}</Typography>
              </Box>
            )}
            {editing && hasPermission('edit-goals', detailedIdentity) && (
              <TextField
                fullWidth
                multiline
                variant="outlined"
                value={goals}
                onChange={handleGoalsChange}
              />
            )}
          </Stack>
        </Stack>
      )}
    </InfoPanel>
  );
};
