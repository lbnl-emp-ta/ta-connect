import {
  SessionAuthenticatedResponse,
  SessionUnauthenticatedResponse,
} from '../types';

async function getSession(): Promise<{ isAuthenticated: boolean }> {
  console.log('Fetching session');
  const response = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/_allauth/browser/v1/auth/session`,
    {
      credentials: 'include',
    }
  );

  const data = (await response.json()) as
    | SessionAuthenticatedResponse
    | SessionUnauthenticatedResponse;
  const okCodes = [200, 401, 410];
  if (okCodes.indexOf(data.status) === -1) {
    throw new Error(JSON.stringify(data));
  }

  return { isAuthenticated: data.meta.is_authenticated };
}

export const sessionsApi = { getSession };
