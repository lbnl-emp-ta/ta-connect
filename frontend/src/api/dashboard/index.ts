import { Identity } from '../../features/identity/IdentityContext';
import { getCSRFToken } from '../../utils/cookies';
import { TARequest } from './types';

/**
 * Generic wrapper for fetch requests that injects the user CSRF token and identity context.
 */
export async function fetchData<T>(url: string, identity?: Identity): Promise<T | null> {
  try {
    const response = await fetch(url, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCSRFToken() || '',
        Context: identity ? JSON.stringify(identity) : '',
      },
    });
    if (!response.ok) {
      throw Error(`Request status: ${response.status}`);
    }
    // Handle 204 when no content is returned
    if (response.status === 204) {
      return null;
    }
    return (await response.json()) as T;
  } catch (error) {
    let message;
    if (error instanceof Error) {
      message = error.message;
    } else {
      message = 'An unknown error has occured.';
    }
    throw Error(`Error: ${message}`);
  }
}

export async function patchRequest(
  requestId: string,
  data: Partial<TARequest>,
  identity?: Identity
): Promise<void> {
  const url = `${import.meta.env.VITE_API_URL}/requests/${requestId}`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCSRFToken() || '',
        Context: identity ? JSON.stringify(identity) : '',
      },
      body: JSON.stringify({ ...data }),
    });

    if (!response.ok) {
      throw Error(`Request status: ${response.status}`);
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
    }
  }
}
