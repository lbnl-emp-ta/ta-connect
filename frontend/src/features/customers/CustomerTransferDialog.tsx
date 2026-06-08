import { TACustomerTransferMutation } from '@/api/dashboard/types';
import { AutocompleteOption } from '@/api/forms/types';
import { customersQueryOptions, useCustomerTransferMutation } from '@/api/queryOptions';
import { AppLink } from '@/components/AppLink';
import { useAdminModeContext } from '@/features/admin-mode/AdminModeContext';
import { useToastContext } from '@/features/toasts/ToastContext';
import { ToastMessage } from '@/features/toasts/ToastMessage';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { Autocomplete, CircularProgress, Stack } from '@mui/material';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import { useSuspenseQuery } from '@tanstack/react-query';
import * as React from 'react';
import { useEffect, useState } from 'react';

interface CustomerTransferDialogProps {
  open: boolean;
  onClose: () => void;
  requestId: number;
  currentCustomerId: number;
}

export const CustomerTransferDialog: React.FC<CustomerTransferDialogProps> = ({
  open,
  onClose,
  requestId,
  currentCustomerId,
}) => {
  const { isAdminMode } = useAdminModeContext();
  const transferCustomerMutation = useCustomerTransferMutation(requestId.toString(), isAdminMode);
  const { data: customers } = useSuspenseQuery(customersQueryOptions());
  const customerOptions: AutocompleteOption[] =
    customers?.map((customer) => {
      return {
        label: customer.name,
        id: customer.id,
      };
    }) || [];
  const currentCustomerOption = customerOptions.find((option) => option.id === currentCustomerId);
  const [newCustomerChoice, setNewCustomerChoice] = useState<AutocompleteOption>(
    currentCustomerOption || customerOptions[0]
  );
  const { setShowToast, setToastMessage, setToastAutoHideDuration } = useToastContext();

  const handleCustomerChange = (
    _event: React.SyntheticEvent<Element, Event>,
    newValue: AutocompleteOption | null
  ) => {
    setNewCustomerChoice(newValue || currentCustomerOption || customerOptions[0]);
  };

  /**
   * Handle submission of edited request information.
   * Only send fields that have changed to the API.
   * If a field is set explicitly to null, it will be cleared in the API.
   */
  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    const mutationData = {} as TACustomerTransferMutation;
    if (newCustomerChoice && newCustomerChoice.id !== currentCustomerId) {
      mutationData.customer_id = newCustomerChoice.id;
    }
    if (Object.keys(mutationData).length > 0) {
      transferCustomerMutation.mutate(mutationData);
    }
    onClose();
  };

  const handleCancel = () => {
    if (currentCustomerOption) {
      setNewCustomerChoice(currentCustomerOption);
    }
    onClose();
  };

  useEffect(() => {
    if (transferCustomerMutation.isPending) {
      setShowToast(true);
      setToastAutoHideDuration(null);
      setToastMessage(
        <ToastMessage icon={<CircularProgress />}>Saving customer information</ToastMessage>
      );
    } else if (transferCustomerMutation.isSuccess) {
      setShowToast(true);
      setToastAutoHideDuration(6000);
      setToastMessage(
        <ToastMessage icon={<CheckCircleIcon />}>Customer information saved</ToastMessage>
      );
    } else if (transferCustomerMutation.isError) {
      setShowToast(true);
      setToastAutoHideDuration(6000);
      setToastMessage(
        <ToastMessage icon={<ErrorIcon />}>{transferCustomerMutation.error.message}</ToastMessage>
      );
    }
  }, [
    transferCustomerMutation.isPending,
    transferCustomerMutation.isSuccess,
    transferCustomerMutation.isError,
    transferCustomerMutation.error?.message,
  ]);

  return (
    <Dialog open={open} maxWidth="sm" fullWidth onClose={handleCancel} disableRestoreFocus>
      <DialogTitle>Transfer Customer</DialogTitle>
      <DialogContent>
        <Stack>
          <DialogContentText>Transfer this request over to a different customer.</DialogContentText>
          <DialogContentText>
            Need to create a new customer?{' '}
            <AppLink to="/experts">Head to the Customers page.</AppLink>
          </DialogContentText>
          <form onSubmit={handleSubmit} id="customer-transfer-form">
            <Autocomplete
              value={newCustomerChoice}
              options={customerOptions}
              renderInput={(params) => <TextField {...params} label="Customer" />}
              onChange={handleCustomerChange}
            />
          </form>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'space-between' }}>
        <span></span>
        <Stack direction="row">
          <Button onClick={handleCancel}>Cancel</Button>
          <Button variant="contained" type="submit" form="customer-transfer-form">
            Save
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};
