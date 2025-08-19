import { useSuspenseQuery } from '@tanstack/react-query';
import { authSessionQueryOptions } from '../utils/queryOptions';
import { SessionAuthenticatedResponse } from '../api/types';

/**
 * Custom hook to retrieve the authenticated user.
 */
export const useUser = () => {
  const {
    data: { meta, data },
  } = useSuspenseQuery(authSessionQueryOptions());
  const user = meta.is_authenticated ? (data as SessionAuthenticatedResponse['data']).user : null;
  return user;
};
