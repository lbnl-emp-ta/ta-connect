import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { useUserMutation } from '../../utils/queryOptions';
import { useUser } from '../../hooks/useUser';
import { TAUser, TAUserMutation } from '../../api/dashboard/types';
import { useEffect, useState } from 'react';
import { useToastContext } from '../toasts/ToastContext';
import { ToastMessage } from '../toasts/ToastMessage';
import { CircularProgress } from '@mui/material';

interface EmailDialogProps {
  open: boolean;
  onClose: () => void;
}

export const EmailDialog: React.FC<EmailDialogProps> = ({ open, onClose }) => {
  const user = useUser();
  const updateUserMutation = useUserMutation(user?.id.toString() || '');
  const [name, setName] = useState<TAUser['name']>(user?.name);
  const [email, setEmail] = useState<TAUser['email']>(user?.email);
  const [phone, setPhone] = useState<TAUser['phone']>(user?.phone);
  const { setShowToast, setToastMessage, setToastAutoHideDuration } = useToastContext();

  /**
   * Handle submission of edited request information.
   * Only send fields that have changed to the API.
   * If a field is set explicitly to null, it will be cleared in the API.
   */
  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    const mutationData = {} as Partial<TAUserMutation>;
    if (name !== user?.name) {
      mutationData.name = name;
    }
    if (email !== user?.email) {
      mutationData.email = email;
    }
    if (phone !== user?.phone) {
      mutationData.phone = phone;
    }
    updateUserMutation.mutate(mutationData);
    onClose();
  };

  useEffect(() => {
    if (updateUserMutation.isPending) {
      setShowToast(true);
      setToastAutoHideDuration(null);
      setToastMessage(
        <ToastMessage icon={<CircularProgress />}>Saving user information</ToastMessage>
      );
    } else if (updateUserMutation.isSuccess) {
      setShowToast(true);
      setToastAutoHideDuration(6000);
      setToastMessage(
        <ToastMessage icon={<CheckCircleIcon />}>User information saved</ToastMessage>
      );
    } else if (updateUserMutation.isError) {
      setShowToast(true);
      setToastAutoHideDuration(6000);
      setToastMessage(
        <ToastMessage icon={<ErrorIcon />}>{updateUserMutation.error.message}</ToastMessage>
      );
    }
  }, [
    updateUserMutation.isPending,
    updateUserMutation.isSuccess,
    updateUserMutation.isError,
    updateUserMutation.error?.message,
  ]);

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Subscribe</DialogTitle>
      <DialogContent>
        <DialogContentText>
          To subscribe to this website, please enter your email address here. We will send updates
          occasionally.
        </DialogContentText>
        <form onSubmit={handleSubmit} id="subscription-form">
          <TextField
            required
            margin="dense"
            id="name"
            name="email"
            label="Email Address"
            type="email"
            fullWidth
            variant="standard"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button type="submit" form="subscription-form">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};
