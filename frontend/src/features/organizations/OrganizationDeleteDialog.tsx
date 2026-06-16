import { TAOrganization } from '@/api/dashboard/types';
import { useDeleteOrganizationMutation } from '@/api/queryOptions';
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

interface OrganizationDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  organization: TAOrganization;
}

export const OrganizationDeleteDialog: React.FC<OrganizationDeleteDialogProps> = ({
  open,
  onClose,
  organization,
}) => {
  const deleteOrganizationMutation = useDeleteOrganizationMutation(organization.id.toString());
  const { setShowToast, setToastMessage, setToastAutoHideDuration } = useToastContext();

  /**
   * Handle submission of edited request information.
   * Only send fields that have changed to the API.
   * If a field is set explicitly to null, it will be cleared in the API.
   */
  const handleConfirm = () => {
    deleteOrganizationMutation.mutate();
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  useEffect(() => {
    if (deleteOrganizationMutation.isPending) {
      setShowToast(true);
      setToastAutoHideDuration(null);
      setToastMessage(
        <ToastMessage icon={<CircularProgress />}>Deleting organization</ToastMessage>
      );
    } else if (deleteOrganizationMutation.isSuccess) {
      setShowToast(true);
      setToastAutoHideDuration(6000);
      setToastMessage(<ToastMessage icon={<CheckCircleIcon />}>Organization deleted</ToastMessage>);
    } else if (deleteOrganizationMutation.isError) {
      setShowToast(true);
      setToastAutoHideDuration(6000);
      setToastMessage(
        <ToastMessage icon={<ErrorIcon />}>{deleteOrganizationMutation.error.message}</ToastMessage>
      );
    }
  }, [
    deleteOrganizationMutation.isPending,
    deleteOrganizationMutation.isSuccess,
    deleteOrganizationMutation.isError,
    deleteOrganizationMutation.error?.message,
  ]);

  return (
    <Dialog open={open} maxWidth="sm" fullWidth onClose={handleCancel} disableRestoreFocus>
      <DialogTitle>Delete Organization</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to delete the organization <strong>{organization.name}</strong>?
        </DialogContentText>
        <DialogContentText sx={{ mt: 2 }}>
          This action cannot be undone. Deleting this organization will remove it from all
          associated requests. Those requests will need to be assigned to a new organization.
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
