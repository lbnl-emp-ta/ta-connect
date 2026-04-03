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

function postForm(action: string, data: Record<string, string>) {
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = import.meta.env.VITE_BACKEND_URL + action;

  for (const key in data) {
    const d = document.createElement('input');
    d.type = 'hidden';
    d.name = key;
    d.value = data[key];
    form.appendChild(d);
  }
  document.body.appendChild(form);
  form.submit();
  // Clean up after a short delay
  setTimeout(() => {
    if (document.body.contains(form)) {
      document.body.removeChild(form);
    }
  }, 100);
}

export function redirectToProvider(
  providerId: string,
  callbackUrl: string,
  process: 'login' | 'connect'
) {
  postForm('/_allauth/browser/v1/auth/provider/redirect', {
    provider: providerId,
    process,
    callback_url: window.location.protocol + '//' + window.location.host + callbackUrl,
    csrfmiddlewaretoken: getCSRFToken() || '',
  });
}
