import CheckIcon from '@mui/icons-material/Check';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ClearIcon from '@mui/icons-material/Clear';
import EditIcon from '@mui/icons-material/Edit';
import ErrorIcon from '@mui/icons-material/Error';
import {
  Box,
  CircularProgress,
  IconButton,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useSuspenseQuery } from '@tanstack/react-query';
import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import { TACustomer, TACustomerMutation } from '../../api/dashboard/types';
import { InfoPanel } from '../../components/InfoPanel';
import {
  organizationQueryOptions,
  statesQueryOptions,
  transmissionPlanningRegionsQueryOptions,
  useCustomerMutation,
} from '../../utils/queryOptions';
import { isValidEmail, isValidUSTelephone } from '../../utils/utils';
import { useIdentityContext } from '../identity/IdentityContext';
import { useToastContext } from '../toasts/ToastContext';
import { ToastMessage } from '../toasts/ToastMessage';

interface RequestCustomerPanelProps {
  customer?: TACustomer;
}

export const RequestCustomerPanel: React.FC<RequestCustomerPanelProps> = ({ customer }) => {
  const { identity } = useIdentityContext();
  const { data: allOrganizations } = useSuspenseQuery(organizationQueryOptions());
  const { data: allTpr } = useSuspenseQuery(transmissionPlanningRegionsQueryOptions());
  const { data: allStates } = useSuspenseQuery(statesQueryOptions());
  const updateCustomerMutation = useCustomerMutation(customer?.id.toString() || '', identity);
  const [editing, setEditing] = useState(false);
  const { setShowToast, setToastMessage } = useToastContext();
  const [org, setOrg] = useState<TACustomer['org']['id']>();
  const [tpr, setTpr] = useState<TACustomer['tpr']['id']>();
  const [email, setEmail] = useState<TACustomer['email']>();
  const [emailError, setEmailError] = useState(false);
  const [emailHelperText, setEmailHelperText] = useState('');
  const [name, setName] = useState<TACustomer['name']>();
  const [phone, setPhone] = useState<TACustomer['phone']>();
  const [phoneError, setPhoneError] = useState(false);
  const [phoneHelperText, setPhoneHelperText] = useState('');
  const [title, setTitle] = useState<TACustomer['title']>();
  const [state, setState] = useState<TACustomer['state']['id']>();

  /**
   * Reset form values based on customer data.
   */
  const resetFormValues = useCallback(() => {
    if (customer) {
      setOrg(customer.org.id);
      setTpr(customer.tpr.id);
      setEmail(customer.email || '');
      setEmailError(false);
      setEmailHelperText('');
      setName(customer.name || '');
      setPhone(customer.phone);
      setPhoneError(false);
      setPhoneHelperText('');
      setTitle(customer.title || '');
      setState(customer.state.id);
    }
  }, [customer]);

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
    console.log('Submitting request update:', mutationData);
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
    setPhoneHelperText(isValid ? '' : 'Not a valid U.S. phone number.');
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
          <span>Customer Information</span>
          {!editing && (
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
          )}
        </Stack>
      }
    >
      {!customer && (
        <Box>
          <Typography>No customer data to show.</Typography>
        </Box>
      )}
      {customer && (
        <TableContainer>
          <Table size="small" sx={{ '& .MuiTableCell-root:first-of-type': { width: '205px' } }}>
            <TableBody>
              {/* TODO: Implement relationship in the API */}
              {/* <TableRow>
                <TableCell>Relationship</TableCell>
                <TableCell>Unknown</TableCell>
              </TableRow> */}
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
                    <TextField
                      fullWidth
                      variant="outlined"
                      value={phone}
                      error={phoneError}
                      helperText={phoneHelperText}
                      onChange={handlePhoneChange}
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
      )}
    </InfoPanel>
  );
};
