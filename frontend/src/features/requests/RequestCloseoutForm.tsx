import { useRequestsContext } from '@/features/requests/RequestsContext';
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormLabel,
  OutlinedInput,
  Radio,
  RadioGroup,
  Stack,
  Typography,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { TACloseoutForm, TARequestDetail } from '../../api/dashboard/types';
import { useSuspenseQuery } from '@tanstack/react-query';
import {
  closeoutQueryOptions,
  useCloseoutMutation,
  useSubmitCloseoutMutation,
} from '@/api/queryOptions';
import { useIdentityContext } from '@/features/identity/IdentityContext';
import { useCallback, useEffect, useState } from 'react';
import { parseBoolean } from '@/utils/utils';
import { useToastContext } from '@/features/toasts/ToastContext';
import { queryClient } from '@/App';
import { ToastMessage } from '@/features/toasts/ToastMessage';

interface RequestCloseoutFormProps {
  requestId: TARequestDetail['id'];
}

export const RequestCloseoutForm: React.FC<RequestCloseoutFormProps> = ({ requestId }) => {
  const { identity } = useIdentityContext();
  const { closeoutDialogOpen, setCloseoutDialogOpen } = useRequestsContext();
  const { setShowToast, setToastMessage } = useToastContext();
  const { data: closeoutForm } = useSuspenseQuery(
    closeoutQueryOptions(requestId.toString(), identity)
  );
  const onMutate = (message: string) => {
    return () => {
      setShowToast(true);
      setToastMessage(
        <ToastMessage>
          <Stack direction="row" alignItems="center">
            <CircularProgress size="1.25rem" color="info" />
            <span>{message}</span>
          </Stack>
        </ToastMessage>
      );
    };
  };
  const onSuccess = (message: string) => {
    return () => {
      queryClient.invalidateQueries();
      setShowToast(true);
      setToastMessage(<ToastMessage icon={<CheckCircleIcon />}>{message}</ToastMessage>);
    };
  };
  const onError = (error: Error) => {
    setShowToast(true);
    setToastMessage(<ToastMessage icon={<ErrorIcon />}>{error.message}</ToastMessage>);
  };
  const closeoutMutation = useCloseoutMutation(requestId.toString(), identity, {
    onMutate: onMutate('Saving closeout form'),
    onSuccess: onSuccess('Closeout form saved successfully'),
    onError: onError,
  });
  const submitCloseoutMutation = useSubmitCloseoutMutation(requestId.toString(), identity, {
    onMutate: onMutate('Submitting closeout form'),
    onSuccess: onSuccess('Closeout form submitted successfully'),
    onError: onError,
  });
  const [experienceDescription, setExperienceDescription] = useState(
    closeoutForm?.experience_description ?? ''
  );
  const [taProvidedDescription, setTaProvidedDescription] = useState(
    closeoutForm?.ta_provided_description ?? ''
  );
  const [impactDescription, setImpactDescription] = useState(
    closeoutForm?.impact_description ?? ''
  );
  const [alignmentDescription, setAlignmentDescription] = useState(
    closeoutForm?.alignment_description ?? ''
  );
  const [customerFeedback, setCustomerFeedback] = useState(closeoutForm?.customer_feedback ?? '');
  const [followUpNeeded, setFollowUpNeeded] = useState(closeoutForm?.follow_up_needed ?? false);
  const [followUpDescription, setFollowUpDescription] = useState(
    closeoutForm?.follow_up_description ?? ''
  );
  const [followUpDuration, setFollowUpDuration] = useState(closeoutForm?.follow_up_duration ?? '');
  const [followUpComments, setFollowUpComments] = useState(closeoutForm?.follow_up_comments ?? '');
  const [followUpHasSameExpert, setFollowUpHasSameExpert] = useState(
    closeoutForm?.follow_up_has_same_expert ?? false
  );

  const handleSave = useCallback(async () => {
    const mutationData = {} as Partial<TACloseoutForm>;
    if (experienceDescription !== closeoutForm?.experience_description) {
      mutationData.experience_description = experienceDescription;
    }
    if (taProvidedDescription !== closeoutForm?.ta_provided_description) {
      mutationData.ta_provided_description = taProvidedDescription;
    }
    if (impactDescription !== closeoutForm?.impact_description) {
      mutationData.impact_description = impactDescription;
    }
    if (alignmentDescription !== closeoutForm?.alignment_description) {
      mutationData.alignment_description = alignmentDescription;
    }
    if (customerFeedback !== closeoutForm?.customer_feedback) {
      mutationData.customer_feedback = customerFeedback;
    }
    if (followUpNeeded !== closeoutForm?.follow_up_needed) {
      mutationData.follow_up_needed = followUpNeeded;
    }
    if (followUpDescription !== closeoutForm?.follow_up_description) {
      mutationData.follow_up_description = followUpDescription;
    }
    if (followUpDuration !== closeoutForm?.follow_up_duration) {
      mutationData.follow_up_duration = followUpDuration;
    }
    if (followUpComments !== closeoutForm?.follow_up_comments) {
      mutationData.follow_up_comments = followUpComments;
    }
    if (followUpHasSameExpert !== closeoutForm?.follow_up_has_same_expert) {
      mutationData.follow_up_has_same_expert = followUpHasSameExpert;
    }
    if (Object.keys(mutationData).length > 0) {
      await closeoutMutation.mutateAsync(mutationData);
    }
  }, [
    closeoutForm,
    closeoutMutation.mutateAsync,
    experienceDescription,
    taProvidedDescription,
    impactDescription,
    alignmentDescription,
    customerFeedback,
    followUpNeeded,
    followUpDescription,
    followUpDuration,
    followUpComments,
    followUpHasSameExpert,
  ]);

  // TODO: handle submission of form (update submitted_date, request status, and request owner)
  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    await handleSave();
    submitCloseoutMutation.mutate();
    setCloseoutDialogOpen(false);
  };

  const handleDialogClose = async () => {
    await handleSave();
    setCloseoutDialogOpen(false);
  };

  // Debounce: save 1s after the user stops making changes
  useEffect(() => {
    if (!closeoutDialogOpen) return;
    const timeout = setTimeout(handleSave, 1000);
    return () => clearTimeout(timeout);
  }, [handleSave, closeoutDialogOpen]);

  return (
    <Dialog
      fullWidth
      maxWidth="lg"
      open={closeoutDialogOpen}
      onClose={handleDialogClose}
      disableRestoreFocus
    >
      <DialogTitle sx={{ borderBottom: '1px solid', borderBottomColor: 'grey.200' }}>
        Closeout Questions for Expert
      </DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit} id="closeout-form">
          <Stack spacing={3} sx={{ marginTop: 2 }}>
            <Typography>
              To close out this request, please provide the following details about your experience
              providing TA for this request.
            </Typography>
            <Typography>
              Your answers are saved automatically as you fill out the form, so feel free to come
              back and edit your answers. When you're ready to submit the form to the lab and
              program for review, click submit at the bottom of this form.
            </Typography>
            <FormControl>
              <FormLabel>{closeoutForm?.questions?.experience_description}</FormLabel>
              <OutlinedInput
                value={experienceDescription}
                multiline
                rows={5}
                onChange={(e) => setExperienceDescription(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <FormLabel>{closeoutForm?.questions?.ta_provided_description}</FormLabel>
              <OutlinedInput
                value={taProvidedDescription}
                multiline
                rows={5}
                onChange={(e) => setTaProvidedDescription(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <FormLabel>{closeoutForm?.questions?.impact_description}</FormLabel>
              <OutlinedInput
                value={impactDescription}
                multiline
                rows={5}
                onChange={(e) => setImpactDescription(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <FormLabel>{closeoutForm?.questions?.alignment_description}</FormLabel>
              <OutlinedInput
                value={alignmentDescription}
                multiline
                rows={5}
                onChange={(e) => setAlignmentDescription(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <FormLabel>{closeoutForm?.questions?.customer_feedback}</FormLabel>
              <OutlinedInput
                value={customerFeedback}
                multiline
                rows={5}
                onChange={(e) => setCustomerFeedback(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <FormLabel id="follow-up-needed-group-label">
                {closeoutForm?.questions?.follow_up_needed}
              </FormLabel>
              <RadioGroup
                value={followUpNeeded}
                aria-labelledby="follow-up-needed-group-label"
                name="radio-buttons-group"
                onChange={(e) => setFollowUpNeeded(parseBoolean(e.target.value))}
              >
                <FormControlLabel value={true} control={<Radio />} label="Yes" />
                <FormControlLabel value={false} control={<Radio />} label="No" />
              </RadioGroup>
            </FormControl>
            <FormControl>
              <FormLabel>{closeoutForm?.questions?.follow_up_description}</FormLabel>
              <OutlinedInput
                value={followUpDescription}
                multiline
                rows={5}
                onChange={(e) => setFollowUpDescription(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <FormLabel>{closeoutForm?.questions?.follow_up_duration}</FormLabel>
              <OutlinedInput
                value={followUpDuration}
                onChange={(e) => setFollowUpDuration(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <FormLabel>{closeoutForm?.questions?.follow_up_comments}</FormLabel>
              <OutlinedInput
                value={followUpComments}
                multiline
                rows={5}
                onChange={(e) => setFollowUpComments(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <FormLabel id="follow-same-expert-group-label">
                {closeoutForm?.questions?.follow_up_has_same_expert}
              </FormLabel>
              <RadioGroup
                value={followUpHasSameExpert}
                aria-labelledby="follow-same-expert-group-label"
                name="radio-buttons-group"
                onChange={(e) => setFollowUpHasSameExpert(parseBoolean(e.target.value))}
              >
                <FormControlLabel value={true} control={<Radio />} label="Yes" />
                <FormControlLabel value={false} control={<Radio />} label="No" />
              </RadioGroup>
            </FormControl>
          </Stack>
        </form>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={handleDialogClose}>
          Back to request
        </Button>
        <Button variant="contained" color="primary" type="submit" form="closeout-form">
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};
