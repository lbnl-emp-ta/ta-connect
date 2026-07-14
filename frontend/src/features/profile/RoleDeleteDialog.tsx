import { TAManageableRoleAssignment } from '@/api/dashboard/types';
import { useManageableRoleDeleteMutation } from '@/api/queryOptions';
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

interface RoleDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  roleAssignment: TAManageableRoleAssignment | null;
}

export const RoleDeleteDialog: React.FC<RoleDeleteDialogProps> = ({
  open,
  onClose,
  roleAssignment,
}) => {
  const deleteRoleMutation = useManageableRoleDeleteMutation();
  const { setShowToast, setToastMessage, setToastAutoHideDuration } = useToastContext();

  /**
   * Revoke the selected role assignment after user confirmation.
   */
  const handleConfirm = () => {
    if (!roleAssignment) {
      return;
    }

    deleteRoleMutation.mutate({
      assignment_id: roleAssignment.assignment_id,
      location: roleAssignment.location as 'program' | 'lab',
    });
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  useEffect(() => {
    if (deleteRoleMutation.isPending) {
      setShowToast(true);
      setToastAutoHideDuration(null);
      setToastMessage(<ToastMessage icon={<CircularProgress />}>Revoking role</ToastMessage>);
    } else if (deleteRoleMutation.isSuccess) {
      setShowToast(true);
      setToastAutoHideDuration(6000);
      setToastMessage(<ToastMessage icon={<CheckCircleIcon />}>Role revoked</ToastMessage>);
    } else if (deleteRoleMutation.isError) {
      setShowToast(true);
      setToastAutoHideDuration(6000);
      setToastMessage(
        <ToastMessage icon={<ErrorIcon />}>{deleteRoleMutation.error.message}</ToastMessage>
      );
    }
  }, [
    deleteRoleMutation.isPending,
    deleteRoleMutation.isSuccess,
    deleteRoleMutation.isError,
    deleteRoleMutation.error?.message,
  ]);

  if (!roleAssignment) {
    return null;
  }

  const assigneeName = roleAssignment.user.name || roleAssignment.user.email;
  const scopeName =
    roleAssignment.location === 'program'
      ? roleAssignment.program?.name || roleAssignment.instance?.name
      : roleAssignment.instance?.name || roleAssignment.program?.name;

  return (
    <Dialog open={open} maxWidth="sm" fullWidth onClose={handleCancel} disableRestoreFocus>
      <DialogTitle>Revoke Role</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to revoke the <strong>{roleAssignment.role.name}</strong> role from{' '}
          <strong>{assigneeName}</strong>?
        </DialogContentText>
        <DialogContentText sx={{ mt: 2 }}>
          This action cannot be undone. This will remove their {roleAssignment.location} access
          {scopeName ? (
            <>
              {' '}
              for <strong>{scopeName}</strong>
            </>
          ) : (
            ''
          )}
          .
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'space-between' }}>
        <span></span>
        <Stack direction="row">
          <Button onClick={handleCancel}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirm}
            disabled={deleteRoleMutation.isPending}
          >
            Revoke
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};
