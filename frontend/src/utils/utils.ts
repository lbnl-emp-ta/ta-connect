import { Identity } from '../features/identity/IdentityContext';
import { getCSRFToken } from './cookies';

/**
 * Validates a US telephone number (10 digits, allows common formatting)
 */
export const isValidUSTelephone = (phone: string): boolean => {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  // Check for exactly 10 digits (standard US number)
  return digits.length === 10;
};

/**
 * Generates accessibility props for tabs in a Material-UI Tabs component.
 */
export const a11yProps = (index: number | string) => {
  return {
    id: `tab-${index}`,
    'aria-controls': `tabpanel-${index}`,
  };
};

/**
 *
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
