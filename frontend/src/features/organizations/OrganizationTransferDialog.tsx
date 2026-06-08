import { TAOrganizationTransferMutation } from '@/api/dashboard/types';
import { AutocompleteOption } from '@/api/forms/types';
import { organizationQueryOptions, useOrganizationTransferMutation } from '@/api/queryOptions';
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

interface OrganizationTransferDialogProps {
  open: boolean;
  onClose: () => void;
  requestId: number;
  currentOrganizationId: number;
}

export const OrganizationTransferDialog: React.FC<OrganizationTransferDialogProps> = ({
  open,
  onClose,
  requestId,
  currentOrganizationId,
}) => {
  const { isAdminMode } = useAdminModeContext();
  const transferOrganizationMutation = useOrganizationTransferMutation(
    requestId.toString(),
    isAdminMode
  );
  const { data: organizations } = useSuspenseQuery(organizationQueryOptions());
  const organizationOptions: AutocompleteOption[] =
    organizations?.map((org) => {
      return {
        label: org.name,
        id: org.id,
      };
    }) || [];
  const currentOrganizationOption = organizationOptions.find(
    (option) => option.id === currentOrganizationId
  );
  const [newOrganizationChoice, setNewOrganizationChoice] = useState<AutocompleteOption>(
    currentOrganizationOption || organizationOptions[0]
  );
  const { setShowToast, setToastMessage, setToastAutoHideDuration } = useToastContext();

  const handleOrganizationChange = (
    _event: React.SyntheticEvent<Element, Event>,
    newValue: AutocompleteOption | null
  ) => {
    setNewOrganizationChoice(newValue || currentOrganizationOption || organizationOptions[0]);
  };

  /**
   * Handle submission of edited request information.
   * Only send fields that have changed to the API.
   * If a field is set explicitly to null, it will be cleared in the API.
   */
  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    const mutationData = {} as TAOrganizationTransferMutation;
    if (newOrganizationChoice && newOrganizationChoice.id !== currentOrganizationId) {
      mutationData.organization_id = newOrganizationChoice.id;
    }
    if (Object.keys(mutationData).length > 0) {
      transferOrganizationMutation.mutate(mutationData);
    }
    onClose();
  };

  const handleCancel = () => {
    if (currentOrganizationOption) {
      setNewOrganizationChoice(currentOrganizationOption);
    }
    onClose();
  };

  useEffect(() => {
    if (transferOrganizationMutation.isPending) {
      setShowToast(true);
      setToastAutoHideDuration(null);
      setToastMessage(
        <ToastMessage icon={<CircularProgress />}>Saving organization information</ToastMessage>
      );
    } else if (transferOrganizationMutation.isSuccess) {
      setShowToast(true);
      setToastAutoHideDuration(6000);
      setToastMessage(
        <ToastMessage icon={<CheckCircleIcon />}>Customer organization saved</ToastMessage>
      );
    } else if (transferOrganizationMutation.isError) {
      setShowToast(true);
      setToastAutoHideDuration(6000);
      setToastMessage(
        <ToastMessage icon={<ErrorIcon />}>
          {transferOrganizationMutation.error.message}
        </ToastMessage>
      );
    }
  }, [
    transferOrganizationMutation.isPending,
    transferOrganizationMutation.isSuccess,
    transferOrganizationMutation.isError,
    transferOrganizationMutation.error?.message,
  ]);

  return (
    <Dialog open={open} maxWidth="sm" fullWidth onClose={handleCancel} disableRestoreFocus>
      <DialogTitle>Transfer Organization</DialogTitle>
      <DialogContent>
        <Stack>
          <DialogContentText>
            Transfer this request over to a different organization.
          </DialogContentText>
          <DialogContentText>
            Need to create a new organization?{' '}
            <AppLink to="/experts">Head to the Organizations page.</AppLink>
          </DialogContentText>
          <form onSubmit={handleSubmit} id="org-transfer-form">
            <Autocomplete
              value={newOrganizationChoice}
              options={organizationOptions}
              renderInput={(params) => <TextField {...params} label="Organization" />}
              onChange={handleOrganizationChange}
            />
          </form>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'space-between' }}>
        <span></span>
        <Stack direction="row">
          <Button onClick={handleCancel}>Cancel</Button>
          <Button variant="contained" type="submit" form="org-transfer-form">
            Save
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};
