import { getCSRFToken } from '../../../utils/cookies';
import { ErrorResponse, SessionAuthenticatedResponse } from '../../types';
import { LoginCredentials } from './types';

export async function loginMutation(credentials: LoginCredentials) {
  const response = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/_allauth/browser/v1/auth/login`,
    {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCSRFToken() || '',
      },
      body: JSON.stringify({ ...credentials }),
    }
  );

  const responseData = (await response.json()) as SessionAuthenticatedResponse | ErrorResponse;

  if (!response.ok) {
    throw Error(`Error: Status ${response.status}`);
  }

  return responseData;
}
