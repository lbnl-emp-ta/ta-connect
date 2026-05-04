import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { topicsQueryOptions, useExpertiseMutation, useLogoutMutation } from '@/api/queryOptions';
import { useUser } from '@/hooks/useUser';
import {
  ExpertiseMutation,
  TADepth,
  TAExpertise,
  TATopic,
  TAUser,
  TAUserMutation,
} from '@/api/dashboard/types';
import { useEffect, useMemo, useState } from 'react';
import { useToastContext } from '@/features/toasts/ToastContext';
import { ToastMessage } from '@/features/toasts/ToastMessage';
import { Autocomplete, Box, CircularProgress, Stack } from '@mui/material';
import { useSuspenseQuery } from '@tanstack/react-query';

interface ExpertisesDialogProps {
  open: boolean;
  onClose: () => void;
  expertises: TAExpertise[];
  labRoleAssignmentId: number;
  depthOptions: TADepth[];
}

export const ExpertisesDialog: React.FC<ExpertisesDialogProps> = ({
  open,
  onClose,
  expertises,
  labRoleAssignmentId,
  depthOptions,
}) => {
  const user = useUser();
  const updateExpertiseMutation = useExpertiseMutation(labRoleAssignmentId.toString() || '');
  const { data: allTopics } = useSuspenseQuery(topicsQueryOptions());
  // const allTopics: TATopic[] = [];
  const [newExpertises, setNewExpertises] = useState<ExpertiseMutation[]>(expertises);
  const defaultDepth = depthOptions[0];
  const newTopics = useMemo(() => {
    return newExpertises.map((expertise) => {
      return expertise.topic;
    });
  }, [newExpertises]);

  const { setShowToast, setToastMessage, setToastAutoHideDuration } = useToastContext();

  const handleTopicsChange = (_event: React.SyntheticEvent, value: TATopic[]) => {
    setNewExpertises(
      value.map((topic) => {
        return {
          topic,
          depth: defaultDepth,
        };
      })
    );
  };

  /**
   * Handle submission of edited request information.
   * Only send fields that have changed to the API.
   * If a field is set explicitly to null, it will be cleared in the API.
   */
  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    updateExpertiseMutation.mutate(newExpertises);
    onClose();
  };

  const handleCancel = () => {
    setNewExpertises(expertises);
    onClose();
  };

  useEffect(() => {
    if (updateExpertiseMutation.isPending) {
      setShowToast(true);
      setToastAutoHideDuration(null);
      setToastMessage(
        <ToastMessage icon={<CircularProgress />}>Saving user information</ToastMessage>
      );
    } else if (updateExpertiseMutation.isSuccess) {
      setShowToast(true);
      setToastAutoHideDuration(6000);
      setToastMessage(
        <ToastMessage icon={<CheckCircleIcon />}>User information saved</ToastMessage>
      );
    } else if (updateExpertiseMutation.isError) {
      setShowToast(true);
      setToastAutoHideDuration(6000);
      setToastMessage(
        <ToastMessage icon={<ErrorIcon />}>{updateExpertiseMutation.error.message}</ToastMessage>
      );
    }
  }, [
    updateExpertiseMutation.isPending,
    updateExpertiseMutation.isSuccess,
    updateExpertiseMutation.isError,
    updateExpertiseMutation.error?.message,
  ]);

  return (
    <Dialog open={open} onClose={onClose} disableRestoreFocus>
      <DialogTitle>Expertises</DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit} id="expertises-form">
          <Stack>
            <Autocomplete
              multiple
              options={allTopics || []}
              getOptionLabel={(option) => option.name}
              value={newTopics || []}
              onChange={handleTopicsChange}
              renderInput={(params) => <TextField {...params} variant="outlined" label="Topics" />}
              disableCloseOnSelect
            />
          </Stack>
        </form>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'space-between' }}>
        <Stack direction="row">
          <Button onClick={handleCancel}>Cancel</Button>
          <Button variant="contained" type="submit" form="expertises-form">
            Save
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};
