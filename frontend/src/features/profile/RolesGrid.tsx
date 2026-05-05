import { RolePanel } from '@/features/profile/RolePanel';
import { Grid, Stack, Typography } from '@mui/material';
import { TADepth, TAExpertise, TAIdentity } from '@/api/dashboard/types';
import { ExpertisesDialog } from '@/features/profile/ExpertisesDialog';
import { useMemo, useState } from 'react';

interface RolesGridProps {
  identities: TAIdentity[];
}

export const RolesGrid: React.FC<RolesGridProps> = ({ identities }) => {
  const [expertisesDialogOpen, setExpertisesDialogOpen] = useState(false);
  const [editingExpertises, setEditingExpertises] = useState<TAExpertise[]>([]);
  const [depthOptions, setDepthOptions] = useState<TADepth[]>([]);
  const [editingLabRoleAssignmentId, setEditingLabRoleAssignmentId] = useState<number | null>(null);
  const systemIdentities = identities.filter(
    (identity) => identity.location === 'system' || identity.location === 'reception'
  );
  const organizationalIdentities = identities.filter(
    (identity) => identity.location === 'program' || identity.location === 'lab'
  );
  const editingProgramName = useMemo(() => {
    return (
      organizationalIdentities.find(
        (identity) => identity.assignment_id === editingLabRoleAssignmentId
      )?.program?.name || ''
    );
  }, [editingLabRoleAssignmentId]);

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
              <Grid size={{ lg: 4, md: 6, xs: 12 }} key={getIdentityKey(identity)}>
                <RolePanel
                  identity={identity}
                  setExpertisesDialogOpen={setExpertisesDialogOpen}
                  setEditingLabRoleAssignmentId={setEditingLabRoleAssignmentId}
                />
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
              <Grid size={{ lg: 4, md: 6, xs: 12 }} key={getIdentityKey(identity)}>
                <RolePanel
                  identity={identity}
                  setExpertisesDialogOpen={setExpertisesDialogOpen}
                  setEditingExpertises={setEditingExpertises}
                  setEditingLabRoleAssignmentId={setEditingLabRoleAssignmentId}
                  setDepthOptions={setDepthOptions}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Stack>
      {editingLabRoleAssignmentId && (
        <ExpertisesDialog
          open={expertisesDialogOpen}
          depthOptions={depthOptions}
          onClose={() => setExpertisesDialogOpen(false)}
          expertises={editingExpertises}
          labRoleAssignmentId={editingLabRoleAssignmentId}
          programName={editingProgramName}
        />
      )}
    </Stack>
  );
};
