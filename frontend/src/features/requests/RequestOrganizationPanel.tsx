import { PermissionAction, TACustomer, TAOrganizationType } from '@/api/dashboard/types';
import {
  organizationQueryOptions,
  organizationTypesQueryOptions,
  statesQueryOptions,
  transmissionPlanningRegionsQueryOptions,
  useCustomerMutation,
} from '@/api/queryOptions';
import { InfoPanel } from '@/components/InfoPanel';
import { useAdminModeContext } from '@/features/admin-mode/AdminModeContext';
import { CustomerEditDialog } from '@/features/customers/CustomerEditDialog';
import { CustomerTransferDialog } from '@/features/customers/CustomerTransferDialog';
import { useToastContext } from '@/features/toasts/ToastContext';
import { ToastMessage } from '@/features/toasts/ToastMessage';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import BusinessIcon from '@mui/icons-material/Business';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditIcon from '@mui/icons-material/Edit';
import ErrorIcon from '@mui/icons-material/Error';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import {
  Button,
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
  Tooltip,
  Typography,
} from '@mui/material';
import { useSuspenseQuery } from '@tanstack/react-query';
import { ChangeEvent, useCallback, useEffect, useState } from 'react';

interface RequestOrganizationPanelProps {
  customer: TACustomer;
  permissions: PermissionAction[];
  requestId: number;
}

export const RequestOrganizationPanel: React.FC<RequestOrganizationPanelProps> = ({
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
  const [customerEditDialogOpen, setCustomerEditDialogOpen] = useState(false);
  const { setShowToast, setToastMessage } = useToastContext();
  const [org, setOrg] = useState<TACustomer['org']['id']>();
  const [orgType, setOrgType] = useState<TAOrganizationType['id']>();
  const [tpr, setTpr] = useState<TACustomer['tpr']['id']>();
  const [state, setState] = useState<TACustomer['state']['id']>();
  const possibleActions: PermissionAction[] = ['edit-customer-info', 'transfer-customer'];
  const canEdit = permissions.some((item) => possibleActions.includes(item));

  /**
   * Reset form values based on customer data.
   */
  const resetFormValues = useCallback(() => {
    setOrg(customer.org.id);
    setOrgType(customer.org.type.id);
    setTpr(customer.tpr.id);
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

  const handleOpenCustomerEditDialog = () => {
    setCustomerMenuAnchorEl(null);
    setCustomerEditDialogOpen(true);
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
            <BusinessIcon color="primary" />
            <Typography variant="h6" component="h3" fontWeight="bold">
              Customer Organization
            </Typography>
          </Stack>
          {canEdit && (
            <>
              <Button
                id="customer-menu-button"
                aria-controls={customerMenuOpen ? 'customer-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={customerMenuOpen ? 'true' : undefined}
                variant="outlined"
                endIcon={<ArrowDropDownIcon />}
                onClick={handleCustomerMenuClick}
              >
                Change organization
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
                {permissions.includes('transfer-customer') && (
                  <MenuItem onClick={handleOpenCustomerTransferDialog}>
                    <ListItemText>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <SwapHorizIcon />
                        <Typography>Transfer request to a different organization</Typography>
                      </Stack>
                    </ListItemText>
                  </MenuItem>
                )}
                {permissions.includes('edit-customer-info') && (
                  <MenuItem onClick={handleOpenCustomerEditDialog}>
                    <ListItemText>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <EditIcon />
                        <Typography>Edit current organization information</Typography>
                      </Stack>
                    </ListItemText>
                  </MenuItem>
                )}
              </Menu>
              <CustomerTransferDialog
                open={customerTransferDialogOpen}
                onClose={() => setCustomerTransferDialogOpen(false)}
                requestId={requestId}
                currentCustomerId={customer.id}
              />
              <CustomerEditDialog
                open={customerEditDialogOpen}
                onClose={() => setCustomerEditDialogOpen(false)}
                customer={customer}
              />
            </>
          )}
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
                  {(!editing || !permissions.includes('edit-customer-info-organization-type')) && (
                    <span>{customer.org.type.name}</span>
                  )}
                  {editing && !permissions.includes('edit-customer-info-organization-type') && (
                    <Tooltip title="Only admins can edit the organization type." placement="top">
                      <ErrorIcon sx={{ color: 'grey.500' }} />
                    </Tooltip>
                  )}
                  {editing && permissions.includes('edit-customer-info-organization-type') && (
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
