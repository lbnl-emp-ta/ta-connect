import { Paper, Stack, Typography } from '@mui/material';
import { TAIdentity } from '../../api/dashboard/types';

interface RolePanelProps {
  identity: TAIdentity;
}

export const RolePanel: React.FC<RolePanelProps> = ({ identity }) => {
  return (
    <Paper sx={{ height: '100%', padding: 2 }}>
      <Typography variant="h5" fontWeight="bold">
        {identity.role.name}
      </Typography>
      <Stack spacing={1}>
        {identity.instance && (
          <>
            <Typography>{identity.instance.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {identity.instance.description}
            </Typography>
          </>
        )}
        {/* {identity.role.name !== 'Expert' && (
          <Box sx={{ flexGrow: 1, textAlign: 'right' }}>
            <Button variant="outlined">Add member</Button>
          </Box>
        )} */}
      </Stack>
    </Paper>
  );
};
