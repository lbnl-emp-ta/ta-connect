import { TADepth, TAExpertise, TATopic } from '@/api/dashboard/types';
import { topicsQueryOptions, useExpertiseMutation } from '@/api/queryOptions';
import { useToastContext } from '@/features/toasts/ToastContext';
import { ToastMessage } from '@/features/toasts/ToastMessage';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import {
  Autocomplete,
  CircularProgress,
  DialogContentText,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import { useSuspenseQuery } from '@tanstack/react-query';
import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';

interface ExpertisesDialogProps {
  open: boolean;
  onClose: () => void;
  expertises: TAExpertise[];
  labRoleAssignmentId: number;
  depthOptions: TADepth[];
  programName: string;
}

export const ExpertisesDialog: React.FC<ExpertisesDialogProps> = ({
  open,
  onClose,
  expertises,
  labRoleAssignmentId,
  depthOptions,
  programName,
}) => {
  const updateExpertiseMutation = useExpertiseMutation(labRoleAssignmentId.toString() || '');
  const { data: allTopics } = useSuspenseQuery(topicsQueryOptions());
  const [newExpertises, setNewExpertises] = useState<Partial<TAExpertise>[]>(expertises);
  const defaultDepth = depthOptions[0];
  const newTopics = useMemo(() => {
    return newExpertises.map((expertise) => {
      return expertise.topic!;
    });
  }, [newExpertises]);

  const { setShowToast, setToastMessage, setToastAutoHideDuration } = useToastContext();

  const handleTopicsChange = (_event: React.SyntheticEvent, value?: TATopic[]) => {
    if (!value) return;
    setNewExpertises(
      value.map((topic) => {
        const existingExpertise = newExpertises.find(
          (expertise) => expertise.topic?.id === topic.id
        );
        return {
          topic,
          depth: existingExpertise?.depth || defaultDepth,
        };
      })
    );
  };

  type DepthChangeEvent =
    | React.ChangeEvent<
        Omit<HTMLInputElement, 'value'> & {
          value: number;
        }
      >
    | (Event & {
        target: {
          value: number;
          name: string;
        };
      });

  const handleDepthChange = (event: DepthChangeEvent, topicId: number) => {
    const newDepthId = event.target.value as number;
    const newDepth = depthOptions.find((option) => option.id === newDepthId);
    if (!newDepth) return;
    setNewExpertises((prev) =>
      prev.map((expertise) => {
        if (expertise.topic?.id === topicId) {
          return { ...expertise, depth: newDepth };
        }
        return expertise;
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
    console.log('Submitting expertises:', newExpertises);
    const mutationData = newExpertises.map((expertise) => {
      return {
        topic: expertise.topic!.id,
        depth: expertise.depth!.id,
      };
    });
    updateExpertiseMutation.mutate(mutationData);
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
    <Dialog open={open} onClose={handleCancel} maxWidth="md" fullWidth disableRestoreFocus>
      <DialogTitle>Expertises</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ marginBottom: 2 }}>
          Edit your expertises for your Expert role in the program, {programName}.
        </DialogContentText>
        <form onSubmit={handleSubmit} id="expertises-form">
          <Stack>
            <FormControl>
              <InputLabel
                htmlFor="expertise-topics-input"
                sx={{ position: 'relative', transform: 'none', mb: 1, fontWeight: 'bold' }}
              >
                Topics
              </InputLabel>
              <Autocomplete
                id="expertise-topics-input"
                multiple
                options={allTopics || []}
                getOptionLabel={(option) => option?.name || ''}
                value={newTopics || []}
                onChange={handleTopicsChange}
                renderInput={(params) => <TextField {...params} variant="outlined" />}
                disableCloseOnSelect
              />
            </FormControl>
            <Typography fontWeight="bold" color="textSecondary">
              Depth per topic
            </Typography>
            <Stack>
              {newExpertises.map((expertise, i) => (
                <Stack key={expertise.id || i} direction="row" alignItems="center">
                  <Typography>{expertise.topic?.name}</Typography>
                  <Select
                    size="small"
                    value={expertise.depth?.id || ''}
                    onChange={(e) => handleDepthChange(e, expertise.topic!.id)}
                  >
                    {depthOptions.map((option) => (
                      <MenuItem key={option.id} value={option.id}>
                        {option.name}
                      </MenuItem>
                    ))}
                  </Select>
                </Stack>
              ))}
            </Stack>
          </Stack>
        </form>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'flex-end' }}>
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
