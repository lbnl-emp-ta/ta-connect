import { Identity } from '../../features/identity/IdentityContext';
import { getCSRFToken } from '../../utils/cookies';
import { TAError, TARequest } from './types';

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

export async function patchRequest<T>(
  requestId: string,
  data: Partial<TARequest>,
  identity?: Identity
): Promise<T | void> {
  const url = `${import.meta.env.VITE_API_URL}/requests/${requestId}`;
  try {
    const response = await fetch(url, {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCSRFToken() || '',
        Context: identity ? JSON.stringify(identity) : '',
      },
      body: JSON.stringify({ ...data }),
    });

    if (!response.ok) {
      const errorData = (await response.json()) as TAError;
      // Some serializer errors don't get returned directly in the message field.
      // Instead they are nested in a non_field_errors array.
      // This is a hacky way to make sure we get the actual message even if it's nested.
      // In the future this should be handled by the backend and the frontend should just
      // handle message as a simple string.
      let errorMessage =
        typeof errorData.message === 'string' ? errorData.message : 'Request update failed';
      if (typeof errorData.message === 'object' && errorData.message.non_field_errors) {
        errorMessage = errorData.message.non_field_errors[0];
      }
      throw new Error(errorMessage);
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof Error) {
      throw Error(error.message);
    }
  }
}

export async function postData<T>(url: string, data?: T, identity?: Identity): Promise<void> {
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
