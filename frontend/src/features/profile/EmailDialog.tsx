import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { useUserMutation } from '../../utils/queryOptions';
import { useUser } from '../../hooks/useUser';
import { TAUser, TAUserMutation } from '../../api/dashboard/types';
import { useState } from 'react';

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
            autoFocus
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
          Subscribe
        </Button>
      </DialogActions>
    </Dialog>
  );
};
