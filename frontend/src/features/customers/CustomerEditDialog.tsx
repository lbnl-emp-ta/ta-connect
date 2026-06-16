import { TACustomer, TACustomerMutation } from '@/api/dashboard/types';
import { useCreateCustomerMutation, useCustomerMutation } from '@/api/queryOptions';
import { PhoneInput } from '@/components/PhoneInput';
import { useAdminModeContext } from '@/features/admin-mode/AdminModeContext';
import { useToastContext } from '@/features/toasts/ToastContext';
import { ToastMessage } from '@/features/toasts/ToastMessage';
import { isValidEmail, isValidUSTelephone } from '@/utils/utils';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from '@mui/material';
import { useCallback, useEffect, useState } from 'react';

interface CustomerEditDialogProps {
  open: boolean;
  onClose: () => void;
  customer?: TACustomer;
}

export const CustomerEditDialog: React.FC<CustomerEditDialogProps> = ({
  open,
  onClose,
  customer,
}) => {
  const { isAdminMode } = useAdminModeContext();
  // If customer prop is provided, use the edit mutation. Otherwise, use the create mutation.
  const customerMutation = customer
    ? useCustomerMutation(customer?.id.toString() || '', isAdminMode)
    : useCreateCustomerMutation();
  const customerData: TACustomer = customer || ({} as TACustomer);
  const { setShowToast, setToastMessage, setToastAutoHideDuration } = useToastContext();
  const [email, setEmail] = useState<TACustomer['email']>();
  const [emailError, setEmailError] = useState(false);
  const [emailHelperText, setEmailHelperText] = useState('');
  const [name, setName] = useState<TACustomer['name']>();
  const [phone, setPhone] = useState<TACustomer['phone']>();
  const [phoneError, setPhoneError] = useState(false);
  const [title, setTitle] = useState<TACustomer['title']>();

  /**
   * Reset form values based on customer data.
   */
  const resetFormValues = useCallback(() => {
    setEmail(customerData.email || '');
    setEmailError(false);
    setEmailHelperText('');
    setName(customerData.name || '');
    setPhone(customerData.phone);
    setPhoneError(false);
    setTitle(customerData.title || '');
  }, [customer]);

  /**
   * Handle submission of edited request information.
   * Only send fields that have changed to the API.
   * If a field is set explicitly to null, it will be cleared in the API.
   */
  const handleEditSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    const mutationData = {} as Partial<TACustomerMutation>;
    if (name !== customer?.name) {
      mutationData.name = name;
    }
    if (email !== customer?.email) {
      mutationData.email = email;
    }
    if (phone !== customer?.phone) {
      mutationData.phone = phone;
    }
    if (title !== customer?.title) {
      mutationData.title = title;
    }
    if (Object.keys(mutationData).length === 0) {
      onClose();
      return;
    }
    customerMutation.mutate(mutationData);
  };

  const handleEditCancel = () => {
    customerMutation.reset();
    resetFormValues();
    onClose();
  };

  const handleNameChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = (
    event
  ) => {
    setName(event.target.value);
  };

  const handleEmailChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = (
    event
  ) => {
    const isValid = isValidEmail(event.target.value);
    setEmailError(!isValid);
    setEmailHelperText(isValid ? '' : 'Not a valid email address.');
    setEmail(event.target.value);
  };

  const handlePhoneChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = (
    event
  ) => {
    const isValid = isValidUSTelephone(event.target.value);
    setPhoneError(!isValid);
    setPhone(event.target.value);
  };

  const handleTitleChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = (
    event
  ) => {
    setTitle(event.target.value);
  };

  useEffect(() => {
    resetFormValues();
  }, [customer, resetFormValues]);

  useEffect(() => {
    if (customerMutation.isPending) {
      setShowToast(true);
      setToastAutoHideDuration(null);
      setToastMessage(
        <ToastMessage icon={<CircularProgress />}>Saving customer information</ToastMessage>
      );
    } else if (customerMutation.isSuccess) {
      onClose();
      setShowToast(true);
      setToastMessage(
        <ToastMessage icon={<CheckCircleIcon />}>Customer information saved</ToastMessage>
      );
    } else if (customerMutation.isError) {
      setShowToast(true);
      setToastMessage(
        <ToastMessage icon={<ErrorIcon />}>{customerMutation.error.message}</ToastMessage>
      );
    }
  }, [customerMutation.isSuccess, customerMutation.isError, customerMutation.error?.message]);

  return (
    <Dialog open={open} maxWidth="md" fullWidth onClose={handleEditCancel} disableRestoreFocus>
      <DialogTitle>{customer ? 'Edit' : 'Create'} Customer</DialogTitle>
      <DialogContent>
        {customer && (
          <Alert severity="info" sx={{ marginBottom: 4 }}>
            Changes to customer information will apply to all requests associated with this
            customer.
          </Alert>
        )}
        <form onSubmit={handleEditSubmit} id="customer-edit-form">
          <Stack>
            <TextField
              label="Full Name"
              fullWidth
              variant="outlined"
              value={name}
              onChange={handleNameChange}
            />
            <TextField
              label="Email"
              fullWidth
              variant="outlined"
              value={email}
              error={emailError}
              helperText={emailHelperText}
              onChange={handleEmailChange}
              type="email"
            />
            <PhoneInput
              label="Phone"
              variant="outlined"
              id="phone-input"
              value={phone}
              onChange={handlePhoneChange}
              error={phoneError}
              required
            />
            <TextField
              label="Job Title"
              fullWidth
              variant="outlined"
              value={title}
              onChange={handleTitleChange}
            />
          </Stack>
        </form>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'space-between' }}>
        <span></span>
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" onClick={handleEditCancel}>
            Cancel
          </Button>
          <Button variant="contained" type="submit" form="customer-edit-form">
            Save
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};
