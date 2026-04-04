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
import { useLogoutMutation, useUserMutation } from '../../utils/queryOptions';
import { useUser } from '../../hooks/useUser';
import { TAUser, TAUserMutation } from '../../api/dashboard/types';
import { useEffect, useMemo, useState } from 'react';
import { useToastContext } from '../toasts/ToastContext';
import { ToastMessage } from '../toasts/ToastMessage';
import { Box, CircularProgress, Stack } from '@mui/material';
import { PhoneInput } from '../../components/PhoneInput';

interface UserInfoDialogProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onClose: () => void;
  hasPlaceholderEmail?: boolean;
}

export const UserInfoDialog: React.FC<UserInfoDialogProps> = ({
  open,
  setOpen,
  onClose,
  hasPlaceholderEmail,
}) => {
  const user = useUser();
  const updateUserMutation = useUserMutation(user?.id.toString() || '');
  const logoutMutation = useLogoutMutation();
  const [name, setName] = useState<TAUser['name']>(user?.name);
  const [email, setEmail] = useState<TAUser['email']>(!hasPlaceholderEmail ? user?.email : '');
  const [phone, setPhone] = useState<TAUser['phone']>(user?.phone);
  const { setShowToast, setToastMessage, setToastAutoHideDuration } = useToastContext();
  const hasMissingInfo = useMemo(() => {
    if (!user) return false;
    if (hasPlaceholderEmail) {
      return true;
    }
    if (!user.name || !user.email || !user.phone) {
      return true;
    }
    return !user?.name || !user?.email || !user?.phone;
  }, [user]);

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
    if (Object.keys(mutationData).length > 0) {
      updateUserMutation.mutate(mutationData);
    }
    onClose();
  };

  const handleCancel = () => {
    setName(user?.name || '');
    setEmail(user?.email || '');
    setPhone(user?.phone || '');
    onClose();
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  useEffect(() => {
    if (hasMissingInfo) {
      setOpen(true);
    }
  }, [hasMissingInfo, setOpen]);

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
    <Dialog open={open} onClose={!hasMissingInfo ? handleCancel : undefined}>
      <DialogTitle>User Information</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ marginBottom: 2 }}>
          {hasMissingInfo &&
            'Your profile is missing some information. Please fill out all fields to ensure you can receive important notifications about your TA assignments.'}
          {!hasMissingInfo &&
            'You can edit your profile information here. Please ensure your email and phone number are up to date so you can receive important notifications about your TA assignments.'}
        </DialogContentText>
        <form onSubmit={handleSubmit} id="profile-form">
          <Stack>
            <TextField
              required
              id="email"
              name="email"
              label="Email Address"
              type="email"
              fullWidth
              variant="standard"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              required
              id="name"
              name="name"
              label="Name"
              type="text"
              fullWidth
              variant="standard"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <PhoneInput
              required
              id="phone"
              name="phone"
              label="Phone Number"
              type="tel"
              fullWidth
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </Stack>
        </form>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'space-between' }}>
        <Box>{hasMissingInfo && <Button onClick={handleLogout}>Logout</Button>}</Box>
        <Stack direction="row">
          {!hasMissingInfo && <Button onClick={handleCancel}>Cancel</Button>}
          <Button variant="contained" type="submit" form="profile-form">
            Save
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};
