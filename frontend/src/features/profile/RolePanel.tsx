import { capitalize } from '@/utils/utils';
import { Chip, Grid, IconButton, Paper, Stack, Tooltip, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { TADepth, TAExpertise, TAIdentity } from '@/api/dashboard/types';

interface RolePanelProps {
  identity: TAIdentity;
  setExpertisesDialogOpen: (open: boolean) => void;
  setEditingExpertises?: (expertises: TAExpertise[]) => void;
  setEditingLabRoleAssignmentId: (id: number | null) => void;
  setDepthOptions?: (options: TADepth[]) => void;
}

export const RolePanel: React.FC<RolePanelProps> = ({
  identity,
  setExpertisesDialogOpen,
  setEditingExpertises,
  setEditingLabRoleAssignmentId,
  setDepthOptions,
}) => {
  const handleEditExpertises = () => {
    setEditingLabRoleAssignmentId(identity.assignment_id);
    if (setDepthOptions) setDepthOptions(identity.program?.depths || []);
    if (setEditingExpertises) setEditingExpertises(identity.expertises || []);
    setExpertisesDialogOpen(true);
  };

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
        {identity.expertises && (
          <Stack spacing={1}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography fontWeight="bold">Expertises</Typography>
              <IconButton size="small" onClick={handleEditExpertises}>
                <EditIcon />
              </IconButton>
            </Stack>
            {identity.expertises.length > 0 && (
              <Grid container spacing={1}>
                {identity.expertises.map((expertise) => (
                  <Grid key={expertise.id}>
                    <Tooltip
                      title={`${expertise.topic.name} (${expertise.depth.name})`}
                      placement="left"
                    >
                      <Chip label={expertise.topic.name} sx={{ maxWidth: 175 }} />
                    </Tooltip>
                  </Grid>
                ))}
              </Grid>
            )}
            {identity.expertises.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                No expertises assigned.
              </Typography>
            )}
          </Stack>
        )}
      </Stack>
    </Paper>
  );
};
