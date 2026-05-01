import { RolePanel } from '@/features/profile/RolePanel';
import { Grid, Stack, Typography } from '@mui/material';
import { TAIdentity } from '../../api/dashboard/types';

interface RolesGridProps {
  identities: TAIdentity[];
}

export const RolesGrid: React.FC<RolesGridProps> = ({ identities }) => {
  const systemIdentities = identities.filter(
    (identity) => identity.location === 'system' || identity.location === 'reception'
  );
  const organizationalIdentities = identities.filter(
    (identity) => identity.location === 'program' || identity.location === 'lab'
  );
  const getIdentityKey = (identity: TAIdentity) => {
    return `${identity.role.id}-${identity.location}-${identity.instance?.id ?? 'none'}`;
  };

  return (
    <Stack spacing={4}>
      <Stack>
        <Typography variant="h5" component="h3">
          System Roles
        </Typography>
        {systemIdentities.length > 0 && (
          <Grid container spacing={2}>
            {systemIdentities.map((identity) => (
              <Grid size={{ lg: 3, md: 6, xs: 12 }} key={getIdentityKey(identity)}>
                <RolePanel identity={identity} />
              </Grid>
            ))}
          </Grid>
        )}
      </Stack>
      <Stack>
        <Typography variant="h5" component="h3">
          Organizational Roles
        </Typography>
        {organizationalIdentities.length > 0 && (
          <Grid container spacing={2}>
            {organizationalIdentities.map((identity) => (
              <Grid size={{ lg: 3, md: 6, xs: 12 }} key={getIdentityKey(identity)}>
                <RolePanel identity={identity} />
              </Grid>
            ))}
          </Grid>
        )}
      </Stack>
    </Stack>
  );
};
