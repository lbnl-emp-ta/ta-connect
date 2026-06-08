import { TAOrganization, TAOrganizationMutation } from '@/api/dashboard/types';
import { State, TransmissionPlanningRegion } from '@/api/forms/types';
import {
  statesQueryOptions,
  transmissionPlanningRegionsQueryOptions,
  useOrganizationMutation,
} from '@/api/queryOptions';
import { useAdminModeContext } from '@/features/admin-mode/AdminModeContext';
import { useToastContext } from '@/features/toasts/ToastContext';
import { ToastMessage } from '@/features/toasts/ToastMessage';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import {
  Alert,
  Autocomplete,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from '@mui/material';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';

interface OrganizationEditDialogProps {
  open: boolean;
  onClose: () => void;
  organization: TAOrganization;
}

export const OrganizationEditDialog: React.FC<OrganizationEditDialogProps> = ({
  open,
  onClose,
  organization,
}) => {
  const { isAdminMode } = useAdminModeContext();
  const updateOrganizationMutation = useOrganizationMutation(
    organization?.id.toString() || '',
    isAdminMode
  );
  const { data: allTransmissionPlanningRegions } = useSuspenseQuery(
    transmissionPlanningRegionsQueryOptions()
  );
  const { data: allStates } = useSuspenseQuery(statesQueryOptions());
  const { setShowToast, setToastMessage, setToastAutoHideDuration } = useToastContext();
  const [name, setName] = useState<TAOrganization['name']>();
  const [address, setAddress] = useState<TAOrganization['address']>();
  const [transmissionPlanningRegion, setTransmissionPlanningRegion] =
    useState<TransmissionPlanningRegion>();
  const [state, setState] = useState<State>();

  /**
   * Reset form values based on organization data.
   */
  const resetFormValues = useCallback(() => {
    setName(organization.name || '');
    setAddress(organization.address || '');
    setTransmissionPlanningRegion(organization.transmission_planning_region);
    setState(organization.state);
  }, [organization]);

  /**
   * Handle submission of edited request information.
   * Only send fields that have changed to the API.
   * If a field is set explicitly to null, it will be cleared in the API.
   */
  const handleEditSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    const mutationData = {} as Partial<TAOrganizationMutation>;
    if (name !== organization?.name) {
      mutationData.name = name;
    }
    if (address !== organization?.address) {
      mutationData.address = address;
    }
    if (transmissionPlanningRegion !== organization?.transmission_planning_region) {
      mutationData.transmission_planning_region = transmissionPlanningRegion?.id;
    }
    if (state !== organization?.state) {
      mutationData.state = state?.id;
    }
    if (Object.keys(mutationData).length === 0) {
      onClose();
      return;
    }
    updateOrganizationMutation.mutate(mutationData);
  };

  const handleEditCancel = () => {
    updateOrganizationMutation.reset();
    resetFormValues();
    onClose();
  };

  const handleNameChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = (
    event
  ) => {
    setName(event.target.value);
  };

  const handleAddressChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = (
    event
  ) => {
    setAddress(event.target.value);
  };

  const handleTransmissionPlanningRegionChange = (
    _event: React.SyntheticEvent<Element, Event>,
    newValue: TransmissionPlanningRegion | null
  ) => {
    setTransmissionPlanningRegion(newValue || undefined);
  };

  const handleStateChange = (
    _event: React.SyntheticEvent<Element, Event>,
    newValue: State | null
  ) => {
    setState(newValue || undefined);
  };

  useEffect(() => {
    resetFormValues();
  }, [organization, resetFormValues]);

  useEffect(() => {
    if (updateOrganizationMutation.isPending) {
      setShowToast(true);
      setToastAutoHideDuration(null);
      setToastMessage(
        <ToastMessage icon={<CircularProgress />}>Saving organization information</ToastMessage>
      );
    } else if (updateOrganizationMutation.isSuccess) {
      onClose();
      setShowToast(true);
      setToastMessage(
        <ToastMessage icon={<CheckCircleIcon />}>Organization information saved</ToastMessage>
      );
    } else if (updateOrganizationMutation.isError) {
      setShowToast(true);
      setToastMessage(
        <ToastMessage icon={<ErrorIcon />}>{updateOrganizationMutation.error.message}</ToastMessage>
      );
    }
  }, [
    updateOrganizationMutation.isSuccess,
    updateOrganizationMutation.isError,
    updateOrganizationMutation.error?.message,
  ]);

  return (
    <Dialog open={open} maxWidth="md" fullWidth onClose={handleEditCancel} disableRestoreFocus>
      <DialogTitle>Edit Organization</DialogTitle>
      <DialogContent>
        <Alert severity="info" sx={{ marginBottom: 4 }}>
          Changes to organization information will apply to all requests associated with this
          organization.
        </Alert>
        <form onSubmit={handleEditSubmit} id="organization-edit-form">
          <Stack>
            <TextField
              label="Full Name"
              fullWidth
              variant="outlined"
              value={name}
              onChange={handleNameChange}
            />
            <TextField
              label="Address"
              fullWidth
              variant="outlined"
              value={address}
              onChange={handleAddressChange}
              multiline
              rows={4}
            />
            <Autocomplete
              value={transmissionPlanningRegion}
              options={allTransmissionPlanningRegions || []}
              getOptionLabel={(option) => option.name}
              onChange={handleTransmissionPlanningRegionChange}
              renderInput={(params) => (
                <TextField {...params} label="Transmission Planning Region" />
              )}
              isOptionEqualToValue={(option, value) => option.id === value.id}
            />
            <Autocomplete
              value={state}
              options={allStates || []}
              getOptionLabel={(option) => option.name}
              onChange={handleStateChange}
              renderInput={(params) => <TextField {...params} label="State" />}
              isOptionEqualToValue={(option, value) => option.id === value.id}
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
          <Button variant="contained" type="submit" form="organization-edit-form">
            Save
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};
