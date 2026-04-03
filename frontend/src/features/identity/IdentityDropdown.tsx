import { InputAdornment, MenuItem, Select, SelectChangeEvent, Stack } from '@mui/material';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { TAIdentity } from '../../api/dashboard/types';
import { identitiesQueryOptions } from '../../utils/queryOptions';
import { useIdentityContext } from '../identity/IdentityContext';

export const IdentityDropdown: React.FC = () => {
  const navigate = useNavigate();
  const { identity, detailedIdentity, setIdentity, setDetailedIdentity } = useIdentityContext();
  const { data: identities } = useSuspenseQuery(identitiesQueryOptions());
  const [identitiesMenuOpen, setIdentitiesMenuOpen] = useState(false);

  const getIdentityKey = (id: TAIdentity) =>
    `${id.role.id}-${id.location}-${id.instance?.id ?? 'none'}`;

  const handleIdentityChange = (event: SelectChangeEvent<string>) => {
    const selected = identities?.find((id) => getIdentityKey(id) === event.target.value);
    if (selected) setDetailedIdentity(selected);
  };

  useEffect(() => {
    if (detailedIdentity) {
      setIdentity({
        user: detailedIdentity.user.id,
        role: detailedIdentity.role.id,
        location: detailedIdentity.location,
        instance: detailedIdentity.instance?.id,
      });
      if (identity && detailedIdentity.role.id !== identity?.role) {
        navigate({ to: '/requests', params: {} });
      }
    } else {
      setDetailedIdentity(identities ? identities[0] : undefined);
    }
  }, [detailedIdentity, identities, setDetailedIdentity, setIdentity]);

  if (!identities || identities.length === 0) {
    return null;
  }

  return (
    <Select
      value={detailedIdentity ? getIdentityKey(detailedIdentity) : ''}
      size="small"
      open={identitiesMenuOpen}
      onOpen={() => setIdentitiesMenuOpen(true)}
      onClose={() => setIdentitiesMenuOpen(false)}
      onChange={handleIdentityChange}
      startAdornment={
        <InputAdornment
          position="start"
          onClick={() => setIdentitiesMenuOpen(true)}
          sx={{ cursor: 'pointer' }}
        >
          Viewing as:
        </InputAdornment>
      }
      sx={{
        backgroundColor: 'white',
      }}
    >
      {identities?.map((identity) => (
        <MenuItem key={getIdentityKey(identity)} value={getIdentityKey(identity)}>
          <Stack direction="row" spacing={1}>
            {identity.location === 'Reception' && <span>{identity.location}</span>}
            <span>{identity.role.name}</span>
            {identity.instance && (
              <>
                <span>|</span>
                <span>{identity.instance.name}</span>
              </>
            )}
          </Stack>
        </MenuItem>
      ))}
    </Select>
  );
};
