import CheckIcon from '@mui/icons-material/Check';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ClearIcon from '@mui/icons-material/Clear';
import EditIcon from '@mui/icons-material/Edit';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import ErrorIcon from '@mui/icons-material/Error';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  ListItemText,
  Menu,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useSuspenseQuery } from '@tanstack/react-query';
import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import {
  PermissionAction,
  TACustomer,
  TACustomerMutation,
  TAOrganizationType,
} from '@/api/dashboard/types';
import { InfoPanel } from '@/components/InfoPanel';
import {
  customersQueryOptions,
  organizationQueryOptions,
  organizationTypesQueryOptions,
  statesQueryOptions,
  transmissionPlanningRegionsQueryOptions,
  useCustomerMutation,
} from '@/api/queryOptions';
import { isValidEmail, isValidUSTelephone } from '@/utils/utils';
import { useAdminModeContext } from '@/features/admin-mode/AdminModeContext';
import { useToastContext } from '@/features/toasts/ToastContext';
import { ToastMessage } from '@/features/toasts/ToastMessage';
import { PhoneInput } from '@/components/PhoneInput';
import { CustomerTransferDialog } from '@/features/customers/CustomerTransferDialog';

interface RequestCustomerPanelProps {
  customer: TACustomer;
  permissions: PermissionAction[];
  requestId: number;
}

export const RequestCustomerPanel: React.FC<RequestCustomerPanelProps> = ({
  customer,
  permissions,
  requestId,
}) => {
  const { isAdminMode } = useAdminModeContext();
  const { data: allOrganizations } = useSuspenseQuery(organizationQueryOptions());
  const { data: allOrganizationTypes } = useSuspenseQuery(organizationTypesQueryOptions());
  const { data: allTpr } = useSuspenseQuery(transmissionPlanningRegionsQueryOptions());
  const { data: allStates } = useSuspenseQuery(statesQueryOptions());
  const updateCustomerMutation = useCustomerMutation(customer?.id.toString() || '', isAdminMode);
  const [editing, setEditing] = useState(false);
  const [customerMenuAnchorEl, setCustomerMenuAnchorEl] = useState<null | HTMLElement>(null);
  const customerMenuOpen = Boolean(customerMenuAnchorEl);
  const [customerTransferDialogOpen, setCustomerTransferDialogOpen] = useState(false);
  const { setShowToast, setToastMessage } = useToastContext();
  const [org, setOrg] = useState<TACustomer['org']['id']>();
  const [orgType, setOrgType] = useState<TAOrganizationType['id']>();
  const [tpr, setTpr] = useState<TACustomer['tpr']['id']>();
  const [email, setEmail] = useState<TACustomer['email']>();
  const [emailError, setEmailError] = useState(false);
  const [emailHelperText, setEmailHelperText] = useState('');
  const [name, setName] = useState<TACustomer['name']>();
  const [phone, setPhone] = useState<TACustomer['phone']>();
  const [phoneError, setPhoneError] = useState(false);
  const [title, setTitle] = useState<TACustomer['title']>();
  const [state, setState] = useState<TACustomer['state']['id']>();
  const possibleActions: PermissionAction[] = ['edit-customer', 'edit-customer-organization-type'];
  const canEdit = permissions.some((item) => possibleActions.includes(item));

  /**
   * Reset form values based on customer data.
   */
  const resetFormValues = useCallback(() => {
    setOrg(customer.org.id);
    setOrgType(customer.org.type.id);
    setTpr(customer.tpr.id);
    setEmail(customer.email || '');
    setEmailError(false);
    setEmailHelperText('');
    setName(customer.name || '');
    setPhone(customer.phone);
    setPhoneError(false);
    setTitle(customer.title || '');
    setState(customer.state.id);
  }, [customer]);

  const handleCustomerMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setCustomerMenuAnchorEl(event.currentTarget);
  };

  const handleCustomerMenuClose = () => {
    setCustomerMenuAnchorEl(null);
  };

  const handleOpenCustomerTransferDialog = () => {
    setCustomerMenuAnchorEl(null);
    setCustomerTransferDialogOpen(true);
  };

  const handleEditClick = () => {
    setEditing(true);
  };

  /**
   * Handle submission of edited request information.
   * Only send fields that have changed to the API.
   * If a field is set explicitly to null, it will be cleared in the API.
   */
  const handleEditSubmit = () => {
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
    if (org !== customer?.org.id) {
      mutationData.org = org;
    }
    if (orgType !== customer?.org.type.id) {
      mutationData.orgType = orgType;
    }
    if (tpr !== customer?.tpr.id) {
      mutationData.tpr = tpr;
    }
    if (state !== customer?.state.id) {
      mutationData.state = state;
    }
    if (Object.keys(mutationData).length === 0) {
      setEditing(false);
      return;
    }
    updateCustomerMutation.mutate(mutationData);
  };

  const handleEditCancel = () => {
    updateCustomerMutation.reset();
    resetFormValues();
    setEditing(false);
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

  const handleOrgChange = (
    event:
      | ChangeEvent<Omit<HTMLInputElement, 'value'> & { value: number }>
      | (Event & { target: { value: number; name: string } })
  ) => {
    setOrg(event.target.value);
  };

  const handleOrgTypeChange = (
    event:
      | ChangeEvent<Omit<HTMLInputElement, 'value'> & { value: number }>
      | (Event & { target: { value: number; name: string } })
  ) => {
    setOrgType(event.target.value);
  };

  const handleTprChange = (
    event:
      | ChangeEvent<Omit<HTMLInputElement, 'value'> & { value: number }>
      | (Event & { target: { value: number; name: string } })
  ) => {
    setTpr(event.target.value);
  };

  const handleStateChange = (
    event:
      | ChangeEvent<Omit<HTMLInputElement, 'value'> & { value: number }>
      | (Event & { target: { value: number; name: string } })
  ) => {
    setState(event.target.value);
  };

  useEffect(() => {
    resetFormValues();
  }, [customer, resetFormValues]);

  useEffect(() => {
    if (updateCustomerMutation.isSuccess) {
      setEditing(false);
      setShowToast(true);
      setToastMessage(
        <ToastMessage icon={<CheckCircleIcon />}>Request information saved</ToastMessage>
      );
    } else if (updateCustomerMutation.isError) {
      setShowToast(true);
      setToastMessage(
        <ToastMessage icon={<ErrorIcon />}>{updateCustomerMutation.error.message}</ToastMessage>
      );
    }
  }, [
    updateCustomerMutation.isSuccess,
    updateCustomerMutation.isError,
    updateCustomerMutation.error?.message,
  ]);

  return (
    <InfoPanel
      header={
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={2} alignItems="center">
            <PeopleAltIcon color="primary" />
            <Typography variant="h5" component="h3" fontWeight="bold">
              Customer Information
            </Typography>
          </Stack>
          <Button
            id="customer-menu-button"
            aria-controls={customerMenuOpen ? 'customer-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={customerMenuOpen ? 'true' : undefined}
            variant="outlined"
            endIcon={<ArrowDropDownIcon />}
            onClick={handleCustomerMenuClick}
          >
            Change customer
          </Button>
          <Menu
            id="customer-menu"
            anchorEl={customerMenuAnchorEl}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={customerMenuOpen}
            aria-labelledby="assign-menu-button"
            onClose={handleCustomerMenuClose}
          >
            <MenuItem onClick={handleOpenCustomerTransferDialog}>
              <ListItemText>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <SwapHorizIcon />
                  <Typography>Transfer request to a different customer</Typography>
                </Stack>
              </ListItemText>
            </MenuItem>
            <MenuItem>
              <ListItemText>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <EditIcon />
                  <Typography>Edit current customer information</Typography>
                </Stack>
              </ListItemText>
            </MenuItem>
          </Menu>
          <CustomerTransferDialog
            open={customerTransferDialogOpen}
            onClose={() => setCustomerTransferDialogOpen(false)}
            requestId={requestId}
            currentCustomerId={customer.id}
          />
          {/* {canEdit && !editing && (
            <IconButton onClick={handleEditClick}>
              <EditIcon />
            </IconButton>
          )}
          {editing && (
            <Stack direction="row">
              {!updateCustomerMutation.isPending && (
                <IconButton onClick={handleEditSubmit}>
                  <CheckIcon />
                </IconButton>
              )}
              {updateCustomerMutation.isPending && <CircularProgress />}
              <IconButton onClick={handleEditCancel}>
                <ClearIcon />
              </IconButton>
            </Stack>
          )} */}
        </Stack>
      }
    >
      <TableContainer>
        <Table
          size="small"
          sx={{
            '& .MuiTableCell-root:first-of-type': {
              color: 'grey.900',
              fontWeight: 'bold',
              width: '205px',
            },
          }}
        >
          <TableBody>
            {editing && (
              <TableRow>
                <TableCell colSpan={2}>
                  <Alert severity="info">
                    Changes to customer information will apply to all requests associated with this
                    customer. If you need to change the associated customer, please contact an
                    administrator or taconnect@lbl.gov.
                  </Alert>
                </TableCell>
              </TableRow>
            )}
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>
                {!editing && <>{customer.name}</>}
                {editing && (
                  <TextField
                    fullWidth
                    variant="outlined"
                    value={name}
                    onChange={handleNameChange}
                  />
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Email</TableCell>
              <TableCell>
                {!editing && <>{customer.email}</>}
                {editing && (
                  <TextField
                    fullWidth
                    variant="outlined"
                    value={email}
                    error={emailError}
                    helperText={emailHelperText}
                    onChange={handleEmailChange}
                    type="email"
                  />
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Phone</TableCell>
              <TableCell>
                {!editing && <>{customer.phone}</>}
                {editing && (
                  <PhoneInput
                    variant="outlined"
                    id="phone-input"
                    value={phone}
                    onChange={handlePhoneChange}
                    error={phoneError}
                    required
                  />
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Job Title</TableCell>
              <TableCell>
                {!editing && <>{customer.title}</>}
                {editing && (
                  <TextField
                    fullWidth
                    variant="outlined"
                    value={title}
                    onChange={handleTitleChange}
                  />
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Transmission Planning Region</TableCell>
              <TableCell>
                {!editing && <>{customer.tpr.name}</>}
                {editing && (
                  <Select value={tpr} onChange={handleTprChange}>
                    {allTpr?.map((tprItem) => (
                      <MenuItem key={tprItem.id} value={tprItem.id}>
                        {tprItem.name}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Organization</TableCell>
              <TableCell>
                {!editing && <>{customer.org.name}</>}
                {editing && (
                  <Select value={org} onChange={handleOrgChange}>
                    {allOrganizations?.map((orgItem) => (
                      <MenuItem key={orgItem.id} value={orgItem.id}>
                        {orgItem.name}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Organization Type</TableCell>
              <TableCell>
                <Stack direction="row" alignItems="center" spacing={1}>
                  {(!editing || !permissions.includes('edit-customer-organization-type')) && (
                    <span>{customer.org.type.name}</span>
                  )}
                  {editing && !permissions.includes('edit-customer-organization-type') && (
                    <Tooltip title="Only admins can edit the organization type." placement="top">
                      <ErrorIcon sx={{ color: 'grey.500' }} />
                    </Tooltip>
                  )}
                  {editing && permissions.includes('edit-customer-organization-type') && (
                    <>
                      <Select value={orgType} onChange={handleOrgTypeChange}>
                        {allOrganizationTypes?.map((orgTypeItem) => (
                          <MenuItem key={orgTypeItem.id} value={orgTypeItem.id}>
                            {orgTypeItem.name}
                          </MenuItem>
                        ))}
                      </Select>
                      <Tooltip
                        title="Changing the organization type will apply to all customers that use this organization."
                        placement="top"
                      >
                        <ErrorIcon sx={{ color: 'grey.500' }} />
                      </Tooltip>
                    </>
                  )}
                </Stack>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>State</TableCell>
              <TableCell>
                {!editing && <>{customer.state.name}</>}
                {editing && (
                  <Select value={state} onChange={handleStateChange}>
                    {allStates?.map((stateItem) => (
                      <MenuItem key={stateItem.id} value={stateItem.id}>
                        {stateItem.name}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </InfoPanel>
  );
};
