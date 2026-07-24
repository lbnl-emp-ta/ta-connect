import { useRequestsContext } from '@/features/requests/RequestsContext';
import {
  Box,
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
import {
  TACloseoutForm,
  TAExpert,
  TARequestDetail,
  PermissionAction,
} from '../../api/dashboard/types';
import { useSuspenseQuery } from '@tanstack/react-query';
import {
  closeoutQueryOptions,
  useApproveCloseoutByLabMutation,
  useApproveCloseoutByProgramMutation,
  useAssignmentMutation,
  useCloseoutMutation,
  useSubmitCloseoutMutation,
} from '@/api/queryOptions';
import { useAdminModeContext } from '@/features/admin-mode/AdminModeContext';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { parseBoolean } from '@/utils/utils';
import { useToastContext } from '@/features/toasts/ToastContext';
import { queryClient } from '@/App';
import { ToastMessage } from '@/features/toasts/ToastMessage';

interface RequestCloseoutFormProps {
  requestId: TARequestDetail['id'];
  expertOwnerId?: TAExpert['owner_id'];
  permissions: PermissionAction[];
}

export const RequestCloseoutForm: React.FC<RequestCloseoutFormProps> = ({
  requestId,
  expertOwnerId,
  permissions,
}) => {
  const { isAdminMode } = useAdminModeContext();
  const { closeoutDialogOpen, setCloseoutDialogOpen } = useRequestsContext();
  const { setShowToast, setToastMessage } = useToastContext();
  const { data: closeoutForm } = useSuspenseQuery(
    closeoutQueryOptions(requestId.toString(), isAdminMode)
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
  const closeoutMutation = useCloseoutMutation(requestId.toString(), isAdminMode, {
    onMutate: onMutate('Saving closeout form'),
    onSuccess: onSuccess('Closeout form saved successfully'),
    onError: onError,
  });
  const submitCloseoutMutation = useSubmitCloseoutMutation(requestId.toString(), isAdminMode, {
    onMutate: onMutate('Submitting closeout form'),
    onSuccess: onSuccess('Closeout form submitted successfully'),
    onError: onError,
  });
  const approveCloseoutByLabMutation = useApproveCloseoutByLabMutation(
    requestId.toString(),
    isAdminMode,
    {
      onMutate: onMutate('Approving closeout form'),
      onSuccess: onSuccess('Closeout form approved by lab'),
      onError: onError,
    }
  );
  const approveCloseoutByProgramMutation = useApproveCloseoutByProgramMutation(
    requestId.toString(),
    isAdminMode,
    {
      onMutate: onMutate('Approving closeout form'),
      onSuccess: onSuccess('Closeout form approved by program and request marked completed'),
      onError: onError,
    }
  );
  const assignRequestMutation = useAssignmentMutation(requestId.toString(), isAdminMode, {
    onMutate: onMutate('Assigning request back to expert'),
    onSuccess: onSuccess('More closeout information requested, reassigned to expert'),
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

  /**
   * Re-initialize the form values when the closeout form data is loaded or updated.
   * e.g. when switching between different requests that both have closeout forms.
   */
  useEffect(() => {
    setExperienceDescription(closeoutForm?.experience_description ?? '');
    setTaProvidedDescription(closeoutForm?.ta_provided_description ?? '');
    setImpactDescription(closeoutForm?.impact_description ?? '');
    setAlignmentDescription(closeoutForm?.alignment_description ?? '');
    setCustomerFeedback(closeoutForm?.customer_feedback ?? '');
    setFollowUpNeeded(closeoutForm?.follow_up_needed ?? false);
    setFollowUpDescription(closeoutForm?.follow_up_description ?? '');
    setFollowUpDuration(closeoutForm?.follow_up_duration ?? '');
    setFollowUpComments(closeoutForm?.follow_up_comments ?? '');
    setFollowUpHasSameExpert(closeoutForm?.follow_up_has_same_expert ?? false);
  }, [closeoutForm]);

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

  const labApproveButtonText = useMemo(() => {
    if (!closeoutForm?.submitted_date || closeoutForm.approved_by_lab) {
      return null;
    } else if (!closeoutForm.approved_by_lab) {
      return 'Approve and send to program';
    }
  }, [closeoutForm?.submitted_date, closeoutForm?.approved_by_lab]);

  const programApproveButtonText = useMemo(() => {
    if (
      !closeoutForm?.submitted_date ||
      !closeoutForm.approved_by_lab ||
      closeoutForm.approved_by_program
    ) {
      return null;
    } else if (!closeoutForm.approved_by_program) {
      return 'Approve and mark completed';
    }
  }, [
    closeoutForm?.submitted_date,
    closeoutForm?.approved_by_lab,
    closeoutForm?.approved_by_program,
  ]);

  const labRejectButtonText = useMemo(() => {
    if (!closeoutForm?.submitted_date || closeoutForm.approved_by_lab) {
      return null;
    } else {
      return 'Reject and send back to expert';
    }
  }, [
    closeoutForm?.submitted_date,
    closeoutForm?.approved_by_lab,
    closeoutForm?.approved_by_program,
  ]);

  const programRejectButtonText = useMemo(() => {
    if (
      !closeoutForm?.submitted_date ||
      !closeoutForm.approved_by_lab ||
      closeoutForm.approved_by_program
    ) {
      return null;
    } else {
      return 'Reject and send back to expert';
    }
  }, [
    closeoutForm?.submitted_date,
    closeoutForm?.approved_by_lab,
    closeoutForm?.approved_by_program,
  ]);

  /**
   * Handle submitting the closeout form for review.
   * This button is only visible to the expert and admins when they are filling out the form.
   */
  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    await handleSave();
    submitCloseoutMutation.mutate();
    setCloseoutDialogOpen(false);
  };

  /**
   * Handle approving the closeout form.
   * If the form hasn't been submitted, this button should not be visible.
   * If the lab has already approved, this means the program is approving and the request should be marked completed.
   * If the lab has not approved, this means the lab is approving and the form should be sent to the program for review.
   */
  const handleApprove = () => {
    if (!closeoutForm || !closeoutForm.submitted_date) {
      return;
    } else if (!closeoutForm.approved_by_lab) {
      approveCloseoutByLabMutation.mutate();
    } else if (!closeoutForm.approved_by_program) {
      approveCloseoutByProgramMutation.mutate();
    }
    setCloseoutDialogOpen(false);
  };

  const handleBackward = () => {
    if (expertOwnerId) {
      assignRequestMutation.mutate({ owner: expertOwnerId });
    }
    setCloseoutDialogOpen(false);
  };

  const handleDialogClose = async () => {
    if (!closeoutForm?.submitted_date) {
      await handleSave();
    }
    setCloseoutDialogOpen(false);
  };

  // Debounce: save 1s after the user stops making changes
  useEffect(() => {
    if (!closeoutDialogOpen || closeoutForm?.submitted_date) return;
    const timeout = setTimeout(handleSave, 1000);
    return () => clearTimeout(timeout);
  }, [handleSave, closeoutDialogOpen]);

  if (!closeoutForm) {
    return null;
  }

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
        {(closeoutForm.submitted_date || !permissions.includes('edit-closeout-responses')) && (
          <Stack spacing={3} sx={{ marginTop: 2 }}>
            <Stack spacing={1}>
              <Typography variant="subtitle1" fontWeight="bold">
                {closeoutForm.questions?.experience_description}
              </Typography>
              <Typography>{closeoutForm.experience_description || '-'}</Typography>
            </Stack>
            <Stack spacing={1}>
              <Typography variant="subtitle1" fontWeight="bold">
                {closeoutForm.questions?.ta_provided_description}
              </Typography>
              <Typography>{closeoutForm.ta_provided_description || '-'}</Typography>
            </Stack>
            <Stack spacing={1}>
              <Typography variant="subtitle1" fontWeight="bold">
                {closeoutForm.questions?.impact_description}
              </Typography>
              <Typography>{closeoutForm.impact_description || '-'}</Typography>
            </Stack>
            <Stack spacing={1}>
              <Typography variant="subtitle1" fontWeight="bold">
                {closeoutForm.questions?.alignment_description}
              </Typography>
              <Typography>{closeoutForm.alignment_description || '-'}</Typography>
            </Stack>
            <Stack spacing={1}>
              <Typography variant="subtitle1" fontWeight="bold">
                {closeoutForm.questions?.customer_feedback}
              </Typography>
              <Typography>{closeoutForm.customer_feedback || '-'}</Typography>
            </Stack>
            <Stack spacing={1}>
              <Typography variant="subtitle1" fontWeight="bold">
                {closeoutForm.questions?.follow_up_needed}
              </Typography>
              <Typography>{closeoutForm.follow_up_needed ? 'Yes' : 'No'}</Typography>
            </Stack>
            <Stack spacing={1}>
              <Typography variant="subtitle1" fontWeight="bold">
                {closeoutForm.questions?.follow_up_description}
              </Typography>
              <Typography>{closeoutForm.follow_up_description || '-'}</Typography>
            </Stack>
            <Stack spacing={1}>
              <Typography variant="subtitle1" fontWeight="bold">
                {closeoutForm.questions?.follow_up_duration}
              </Typography>
              <Typography>{closeoutForm.follow_up_duration || '-'}</Typography>
            </Stack>
            <Stack spacing={1}>
              <Typography variant="subtitle1" fontWeight="bold">
                {closeoutForm.questions?.follow_up_comments}
              </Typography>
              <Typography>{closeoutForm.follow_up_comments || '-'}</Typography>
            </Stack>
            <Stack spacing={1}>
              <Typography variant="subtitle1" fontWeight="bold">
                {closeoutForm.questions?.follow_up_has_same_expert}
              </Typography>
              <Typography>{closeoutForm.follow_up_has_same_expert ? 'Yes' : 'No'}</Typography>
            </Stack>
          </Stack>
        )}
        {!closeoutForm.submitted_date && permissions.includes('edit-closeout-responses') && (
          <form onSubmit={handleSubmit} id="closeout-form">
            <Stack spacing={3} sx={{ marginTop: 2 }}>
              <Typography>
                To close out this request, please provide the following details about your
                experience providing TA for this request.
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
              <Box>
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
              </Box>
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
              <Box>
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
              </Box>
            </Stack>
          </form>
        )}
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={handleDialogClose}>
          Back to request
        </Button>
        {labRejectButtonText && permissions.includes('reject-closeout-by-lab') && (
          <Button variant="contained" color="error" onClick={handleBackward}>
            {labRejectButtonText}
          </Button>
        )}
        {programRejectButtonText && permissions.includes('reject-closeout-by-program') && (
          <Button variant="contained" color="error" onClick={handleBackward}>
            {programRejectButtonText}
          </Button>
        )}
        {!closeoutForm.submitted_date && permissions.includes('edit-closeout-responses') && (
          <Button variant="contained" color="primary" type="submit" form="closeout-form">
            Submit for review
          </Button>
        )}
        {labApproveButtonText && permissions.includes('approve-closeout-by-lab') && (
          <Button variant="contained" color="primary" onClick={handleApprove}>
            {labApproveButtonText}
          </Button>
        )}
        {programApproveButtonText && permissions.includes('approve-closeout-by-program') && (
          <Button variant="contained" color="primary" onClick={handleApprove}>
            {programApproveButtonText}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
