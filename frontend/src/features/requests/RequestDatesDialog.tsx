import { useRequestsContext } from '@/features/requests/RequestsContext';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { PickerValue } from '@mui/x-date-pickers/internals';
import dayjs, { Dayjs } from 'dayjs';
import { useCallback, useEffect, useState } from 'react';
import { TARequestDetail, TARequestDetailMutation } from '../../api/dashboard/types';
import { useRequestMutation } from '../../api/queryOptions';
import { useIdentityContext } from '../identity/IdentityContext';
import { useToastContext } from '../toasts/ToastContext';
import { ToastMessage } from '../toasts/ToastMessage';

interface RequestDatesDialogProps {
  request?: TARequestDetail;
}

export const RequestDatesDialog: React.FC<RequestDatesDialogProps> = ({ request }) => {
  const { identity } = useIdentityContext();
  const updateRequestMutation = useRequestMutation(request?.id.toString() || '', identity);
  const { datesDialogOpen, setDatesDialogOpen } = useRequestsContext();
  const { setShowToast, setToastMessage } = useToastContext();
  const [projectedStartDate, setProjectedStartDate] = useState<Dayjs>();
  const [projectedCompletionDate, setProjectedCompletionDate] = useState<Dayjs>();
  const [completionDateError, setCompletionDateError] = useState(false);

  /**
   * Reset form values based on request data.
   */
  const resetFormValues = useCallback(() => {
    if (request) {
      setProjectedStartDate(request.proj_start_date ? dayjs(request.proj_start_date) : undefined);
      setProjectedCompletionDate(
        request.proj_completion_date ? dayjs(request.proj_completion_date) : undefined
      );
    }
  }, [request]);

  /**
   * Handle submission of edited request information.
   * Only send fields that have changed to the API.
   * If a field is set explicitly to null, it will be cleared in the API.
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectedCompletionDate) {
      setCompletionDateError(true);
      return;
    }
    setCompletionDateError(false);
    const mutationData = {} as Partial<TARequestDetailMutation>;
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
    // In the outside chance that proj_completion_date is already set (by admin) and goes unchanged,
    // we still want to trigger a mutation so that the status changes to PROVIDING_TA.
    if (projectedCompletionDate) {
      mutationData.proj_completion_date = projectedCompletionDate.format('YYYY-MM-DD');
    }
    if (Object.keys(mutationData).length > 0) {
      updateRequestMutation.mutate(mutationData);
    }
  };

  const handleCancel = () => {
    updateRequestMutation.reset();
    resetFormValues();
    setDatesDialogOpen(false);
  };

  const handleProjectedStartDateChange = (value: PickerValue) => {
    setProjectedStartDate(value as Dayjs);
  };

  const handleProjectedCompletionDateChange = (value: PickerValue) => {
    setProjectedCompletionDate(value as Dayjs);
    if (value) setCompletionDateError(false);
  };

  useEffect(() => {
    resetFormValues();
  }, [request, resetFormValues]);

  useEffect(() => {
    if (updateRequestMutation.isSuccess) {
      setDatesDialogOpen(false);
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
    <Dialog open={datesDialogOpen} onClose={handleCancel} disableRestoreFocus>
      <DialogTitle>Enter dates to start TA</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ marginBottom: 4 }}>
          Edit the projected start date (optional) and projected completion date (required) to begin
          providing TA for this request.
        </DialogContentText>
        <form onSubmit={handleSubmit} id="request-dates-form">
          <Stack>
            <DatePicker
              label="Projected Start Date"
              value={projectedStartDate || null}
              onChange={handleProjectedStartDateChange}
              slotProps={{
                field: {
                  clearable: true,
                },
              }}
            />
            <DatePicker
              label="Projected Completion Date"
              value={projectedCompletionDate || null}
              onChange={handleProjectedCompletionDateChange}
              slotProps={{
                field: { clearable: true },
                textField: {
                  required: true,
                  error: completionDateError,
                },
              }}
            />
          </Stack>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel}>Cancel</Button>
        <Button variant="contained" type="submit" form="request-dates-form">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};
