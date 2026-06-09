import { TAOrganization, TAOrganizationMutation, TAOrganizationType } from '@/api/dashboard/types';
import { State, TransmissionPlanningRegion } from '@/api/forms/types';
import {
  organizationTypesQueryOptions,
  statesQueryOptions,
  transmissionPlanningRegionsQueryOptions,
  useCreateOrganizationMutation,
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
  organization?: TAOrganization;
}

export const OrganizationEditDialog: React.FC<OrganizationEditDialogProps> = ({
  open,
  onClose,
  organization,
}) => {
  const { isAdminMode } = useAdminModeContext();
  // If organization prop is provided, use the edit mutation. Otherwise, use the create mutation.
  const organizationMutation = organization
    ? useOrganizationMutation(organization?.id.toString() || '', isAdminMode)
    : useCreateOrganizationMutation();
  const organizationData: TAOrganization = organization || ({} as TAOrganization);
  const { data: allTransmissionPlanningRegions } = useSuspenseQuery(
    transmissionPlanningRegionsQueryOptions()
  );
  const { data: allStates } = useSuspenseQuery(statesQueryOptions());
  const { data: allOrganizationTypes } = useSuspenseQuery(organizationTypesQueryOptions());
  const { setShowToast, setToastMessage, setToastAutoHideDuration } = useToastContext();
  const [name, setName] = useState<TAOrganization['name']>();
  const [address, setAddress] = useState<TAOrganization['address']>();
  const [transmissionPlanningRegion, setTransmissionPlanningRegion] =
    useState<TransmissionPlanningRegion>();
  const [state, setState] = useState<State>();
  const [orgType, setOrgType] = useState<TAOrganizationType>();

  /**
   * Reset form values based on organization data.
   */
  const resetFormValues = useCallback(() => {
    setName(organizationData.name || '');
    setAddress(organizationData.address || '');
    setTransmissionPlanningRegion(organizationData.transmission_planning_region);
    setState(organizationData.state);
    setOrgType(organizationData.type);
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
    if (orgType !== organization?.type) {
      mutationData.type = orgType?.id;
    }
    if (Object.keys(mutationData).length === 0) {
      onClose();
      return;
    }
    organizationMutation.mutate(mutationData);
  };

  const handleEditCancel = () => {
    organizationMutation.reset();
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

  const handleOrgTypeChange = (
    _event: React.SyntheticEvent<Element, Event>,
    newValue: TAOrganizationType | null
  ) => {
    setOrgType(newValue || undefined);
  };

  useEffect(() => {
    resetFormValues();
  }, [organization, resetFormValues]);

  useEffect(() => {
    if (organizationMutation.isPending) {
      setShowToast(true);
      setToastAutoHideDuration(null);
      setToastMessage(
        <ToastMessage icon={<CircularProgress />}>Saving organization information</ToastMessage>
      );
    } else if (organizationMutation.isSuccess) {
      onClose();
      setShowToast(true);
      setToastMessage(
        <ToastMessage icon={<CheckCircleIcon />}>Organization information saved</ToastMessage>
      );
    } else if (organizationMutation.isError) {
      setShowToast(true);
      setToastMessage(
        <ToastMessage icon={<ErrorIcon />}>{organizationMutation.error.message}</ToastMessage>
      );
    }
  }, [
    organizationMutation.isSuccess,
    organizationMutation.isError,
    organizationMutation.error?.message,
  ]);

  return (
    <Dialog open={open} maxWidth="md" fullWidth onClose={handleEditCancel} disableRestoreFocus>
      <DialogTitle>{organization ? 'Edit' : 'Create'} Organization</DialogTitle>
      <DialogContent>
        {organization && (
          <Alert severity="info" sx={{ marginBottom: 4 }}>
            Changes to organization information will apply to all requests associated with this
            organization.
          </Alert>
        )}
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
            <Autocomplete
              value={orgType}
              options={allOrganizationTypes || []}
              getOptionLabel={(option) => option.name}
              onChange={handleOrgTypeChange}
              renderInput={(params) => <TextField {...params} label="Organization Type" />}
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
