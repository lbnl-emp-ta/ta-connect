import { Button, Stack, Switch } from '@mui/material';
import { useSuspenseQuery } from '@tanstack/react-query';
import { identitiesQueryOptions } from '../../api/queryOptions';
import { useAdminModeContext } from './AdminModeContext';
import { TARole } from '@/api/dashboard/types';

export const AdminModeToggle: React.FC = () => {
  const { isAdminMode, setIsAdminMode } = useAdminModeContext();
  const { data: identities } = useSuspenseQuery(identitiesQueryOptions());
  const hasAdminIdentity = identities?.some((identity) => identity.role.name === TARole.Admin);

  const handleToggle = () => {
    setIsAdminMode(!isAdminMode);
  };

  if (!hasAdminIdentity) {
    return null;
  }

  return (
    <Button variant="outlined" color="success" size="small" onClick={handleToggle}>
      <Stack direction="row" alignItems="center" spacing={0}>
        <span>Admin Mode</span>
        <Switch
          color="success"
          checked={isAdminMode}
          sx={{
            '& .MuiSwitch-track': { borderWidth: 1, borderStyle: 'solid', borderColor: 'grey.500' },
          }}
        />
      </Stack>
    </Button>
  );
};
