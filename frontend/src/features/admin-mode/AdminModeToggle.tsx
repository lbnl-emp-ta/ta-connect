import { FormControlLabel, FormGroup, Switch } from '@mui/material';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { identitiesQueryOptions } from '../../api/queryOptions';
import { useAdminModeContext } from './AdminModeContext';

export const AdminModeToggle: React.FC = () => {
  const navigate = useNavigate();
  const { isAdminMode, setIsAdminMode } = useAdminModeContext();
  const { data: identities } = useSuspenseQuery(identitiesQueryOptions());

  const handleToggle = (_event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    setIsAdminMode(checked);
  };

  if (!identities || identities.length === 0) {
    return null;
  }

  return (
    <FormGroup>
      <FormControlLabel
        control={<Switch checked={isAdminMode} onChange={handleToggle} />}
        label="Admin Mode"
      />
    </FormGroup>
  );
};
