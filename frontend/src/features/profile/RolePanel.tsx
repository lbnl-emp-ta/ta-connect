import { capitalize } from '@/utils/utils';
import { Paper, Stack, Typography } from '@mui/material';
import { TAIdentity } from '../../api/dashboard/types';

interface RolePanelProps {
  identity: TAIdentity;
}

export const RolePanel: React.FC<RolePanelProps> = ({ identity }) => {
  return (
    <Paper sx={{ height: '100%', padding: 2 }}>
      <Stack>
        <Stack spacing={0}>
          <Typography variant="h5" fontWeight="bold" color="primary">
            {identity.role.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {identity.role.description}
          </Typography>
        </Stack>
        {identity.program && (
          <Stack spacing={0}>
            <Typography fontWeight="bold">Program: {identity.program.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {identity.program.description}
            </Typography>
          </Stack>
        )}
        {identity.instance && (
          <Stack spacing={0}>
            <Typography fontWeight="bold">
              {capitalize(identity.location)}: {identity.instance.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {identity.instance.description}
            </Typography>
          </Stack>
        )}
      </Stack>
    </Paper>
  );
};
