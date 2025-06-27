import { getCSRFToken } from '../../utils/cookies';
import { IntakeFormData } from './types';

export async function submitIntakeMutation(formData: IntakeFormData) {
  const url = `${import.meta.env.VITE_API_URL}/process-intake-form/`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCSRFToken() || '',
      },
      body: JSON.stringify({ ...formData }),
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
