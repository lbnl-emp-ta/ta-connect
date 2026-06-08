import { PermissionAction, TAOrganization } from '@/api/dashboard/types';
import { InfoPanel } from '@/components/InfoPanel';
import { OrganizationEditDialog } from '@/features/organizations/OrganizationEditDialog';
import { OrganizationTransferDialog } from '@/features/organizations/OrganizationTransferDialog';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import BusinessIcon from '@mui/icons-material/Business';
import EditIcon from '@mui/icons-material/Edit';
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

interface RequestOrganizationPanelProps {
  organization: TAOrganization;
  permissions: PermissionAction[];
  requestId: number;
}

export const RequestOrganizationPanel: React.FC<RequestOrganizationPanelProps> = ({
  organization,
  permissions,
  requestId,
}) => {
  const [organizationMenuAnchorEl, setOrganizationMenuAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const organizationMenuOpen = Boolean(organizationMenuAnchorEl);
  const [organizationTransferDialogOpen, setOrganizationTransferDialogOpen] = useState(false);
  const [organizationEditDialogOpen, setOrganizationEditDialogOpen] = useState(false);
  const possibleActions: PermissionAction[] = ['edit-organization-info', 'transfer-organization'];
  const canEdit = permissions.some((item) => possibleActions.includes(item));

  const handleOrganizationMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setOrganizationMenuAnchorEl(event.currentTarget);
  };

  const handleOrganizationMenuClose = () => {
    setOrganizationMenuAnchorEl(null);
  };

  const handleOpenOrganizationTransferDialog = () => {
    setOrganizationMenuAnchorEl(null);
    setOrganizationTransferDialogOpen(true);
  };

  const handleOpenOrganizationEditDialog = () => {
    setOrganizationMenuAnchorEl(null);
    setOrganizationEditDialogOpen(true);
  };

  return (
    <InfoPanel
      header={
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={2} alignItems="center">
            <BusinessIcon color="primary" />
            <Typography variant="h6" component="h3" fontWeight="bold">
              Organization Organization
            </Typography>
          </Stack>
          {canEdit && (
            <>
              <Button
                id="organization-menu-button"
                aria-controls={organizationMenuOpen ? 'organization-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={organizationMenuOpen ? 'true' : undefined}
                variant="outlined"
                endIcon={<ArrowDropDownIcon />}
                onClick={handleOrganizationMenuClick}
              >
                Change organization
              </Button>
              <Menu
                id="organization-menu"
                anchorEl={organizationMenuAnchorEl}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={organizationMenuOpen}
                aria-labelledby="assign-menu-button"
                onClose={handleOrganizationMenuClose}
              >
                {permissions.includes('transfer-organization') && (
                  <MenuItem onClick={handleOpenOrganizationTransferDialog}>
                    <ListItemText>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <SwapHorizIcon />
                        <Typography>Transfer request to a different organization</Typography>
                      </Stack>
                    </ListItemText>
                  </MenuItem>
                )}
                {permissions.includes('edit-organization-info') && (
                  <MenuItem onClick={handleOpenOrganizationEditDialog}>
                    <ListItemText>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <EditIcon />
                        <Typography>Edit current organization information</Typography>
                      </Stack>
                    </ListItemText>
                  </MenuItem>
                )}
              </Menu>
              <OrganizationTransferDialog
                open={organizationTransferDialogOpen}
                onClose={() => setOrganizationTransferDialogOpen(false)}
                requestId={requestId}
                currentOrganizationId={organization.id}
              />
              <OrganizationEditDialog
                open={organizationEditDialogOpen}
                onClose={() => setOrganizationEditDialogOpen(false)}
                organization={organization}
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
              <TableCell>{organization.name}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Organization Type</TableCell>
              <TableCell>{organization.type.name}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Transmission Planning Region</TableCell>
              <TableCell>{organization.transmission_planning_region.name}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>State</TableCell>
              <TableCell>{organization.state.name}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </InfoPanel>
  );
};
