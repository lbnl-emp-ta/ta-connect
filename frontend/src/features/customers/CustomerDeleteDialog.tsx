import { TACustomer } from '@/api/dashboard/types';
import { useDeleteCustomerMutation } from '@/api/queryOptions';
import { useToastContext } from '@/features/toasts/ToastContext';
import { ToastMessage } from '@/features/toasts/ToastMessage';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { CircularProgress, Stack } from '@mui/material';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import * as React from 'react';
import { useEffect } from 'react';

interface CustomerDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  customer: TACustomer;
}

export const CustomerDeleteDialog: React.FC<CustomerDeleteDialogProps> = ({
  open,
  onClose,
  customer,
}) => {
  const deleteCustomerMutation = useDeleteCustomerMutation(customer.id.toString());
  const { setShowToast, setToastMessage, setToastAutoHideDuration } = useToastContext();

  /**
   * Handle submission of edited request information.
   * Only send fields that have changed to the API.
   * If a field is set explicitly to null, it will be cleared in the API.
   */
  const handleConfirm = () => {
    deleteCustomerMutation.mutate();
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  useEffect(() => {
    if (deleteCustomerMutation.isPending) {
      setShowToast(true);
      setToastAutoHideDuration(null);
      setToastMessage(<ToastMessage icon={<CircularProgress />}>Deleting customer</ToastMessage>);
    } else if (deleteCustomerMutation.isSuccess) {
      setShowToast(true);
      setToastAutoHideDuration(6000);
      setToastMessage(<ToastMessage icon={<CheckCircleIcon />}>Customer deleted</ToastMessage>);
    } else if (deleteCustomerMutation.isError) {
      setShowToast(true);
      setToastAutoHideDuration(6000);
      setToastMessage(
        <ToastMessage icon={<ErrorIcon />}>{deleteCustomerMutation.error.message}</ToastMessage>
      );
    }
  }, [
    deleteCustomerMutation.isPending,
    deleteCustomerMutation.isSuccess,
    deleteCustomerMutation.isError,
    deleteCustomerMutation.error?.message,
  ]);

  return (
    <Dialog open={open} maxWidth="sm" fullWidth onClose={handleCancel} disableRestoreFocus>
      <DialogTitle>Delete Customer</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to delete the customer{' '}
          <strong>
            {customer.name} ({customer.email})
          </strong>
          ?
        </DialogContentText>
        <DialogContentText sx={{ mt: 2 }}>
          This action cannot be undone. Deleting this customer will remove it from all associated
          requests. Those requests will need to be assigned to a new customer.
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'space-between' }}>
        <span></span>
        <Stack direction="row">
          <Button onClick={handleCancel}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleConfirm}>
            Delete
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};
