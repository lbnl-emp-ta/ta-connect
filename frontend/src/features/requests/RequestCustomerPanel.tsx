import { PermissionAction, TACustomer } from '@/api/dashboard/types';
import { InfoPanel } from '@/components/InfoPanel';
import { CustomerEditDialog } from '@/features/customers/CustomerEditDialog';
import { CustomerTransferDialog } from '@/features/customers/CustomerTransferDialog';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import EditIcon from '@mui/icons-material/Edit';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import {
  Button,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
} from '@mui/material';
import { useState } from 'react';

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
  const [customerMenuAnchorEl, setCustomerMenuAnchorEl] = useState<null | HTMLElement>(null);
  const customerMenuOpen = Boolean(customerMenuAnchorEl);
  const [customerTransferDialogOpen, setCustomerTransferDialogOpen] = useState(false);
  const [customerEditDialogOpen, setCustomerEditDialogOpen] = useState(false);
  const possibleActions: PermissionAction[] = ['edit-customer-info', 'transfer-customer'];
  const canEdit = permissions.some((item) => possibleActions.includes(item));

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

  return (
    <InfoPanel
      header={
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={2} alignItems="center">
            <PeopleAltIcon color="primary" />
            <Typography variant="h6" component="h3" fontWeight="bold">
              Customer Contact
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
                {permissions.includes('transfer-customer') && (
                  <MenuItem onClick={handleOpenCustomerTransferDialog}>
                    <ListItemText>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <SwapHorizIcon />
                        <Typography>Transfer request to a different customer</Typography>
                      </Stack>
                    </ListItemText>
                  </MenuItem>
                )}
                {permissions.includes('edit-customer-info') && (
                  <MenuItem onClick={handleOpenCustomerEditDialog}>
                    <ListItemText>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <EditIcon />
                        <Typography>Edit current customer information</Typography>
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
              <TableCell>Name</TableCell>
              <TableCell>{customer.name}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Email</TableCell>
              <TableCell>{customer.email}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Phone</TableCell>
              <TableCell>{customer.phone}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Job Title</TableCell>
              <TableCell>{customer.title}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </InfoPanel>
  );
};
