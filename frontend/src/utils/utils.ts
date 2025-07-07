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
 * Captilize the first letter of a string.
 */
export const capitalize = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Format a date string to a more readable format.
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};
