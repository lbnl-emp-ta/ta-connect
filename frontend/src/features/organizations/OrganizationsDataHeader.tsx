import { Typography } from '@mui/material';
import { TAOrganization } from '@/api/dashboard/types';

interface OrganizationsDataHeaderProps {
  organizations: TAOrganization[] | null;
}

export const OrganizationsDataHeader: React.FC<OrganizationsDataHeaderProps> = ({
  organizations,
}) => {
  if (organizations === null) {
    return <Typography sx={{ flex: 1, mx: 0.5 }}>Loading...</Typography>;
  }
  return (
    <Typography sx={{ flex: 1, mx: 0.5 }}>
      {organizations.length} {organizations.length === 1 ? 'organization' : 'organizations'}
    </Typography>
  );
};
