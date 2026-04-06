import { TAIdentity, TARequestDetail, TARole } from '../api/dashboard/types';

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
 * Validates an email address using a regular expression.
 * An empty string is considered valid.
 */
export const isValidEmail = (email: string) => {
  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (re.test(email) || email === '') {
    return true;
  } else {
    return false;
  }
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
 * Format a datetime string to a more readable format.
 */
export const formatDatetime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
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
  });
};

export const downloadBlob = (blob: Blob, filename: string): void => {
  var url = window.URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
};

type PermissionAction =
  | 'edit-depth'
  | 'edit-topics'
  | 'edit-description'
  | 'edit-projected-start-date'
  | 'edit-projected-completion-date'
  | 'edit-actual-completion-date'
  | 'edit-customer'
  | 'edit-organization-type';

/**
 * Frontend function for checking if a user has permission to perform a certain action based on their role.
 * Note that this is used purely for changing UI elements and is not a substitute for backend permission checks.
 * The backend is the source of truth for permissions.
 */
export const hasPermission = (action: PermissionAction, detailedIdentity?: TAIdentity): boolean => {
  if (!detailedIdentity || !detailedIdentity.role) return false;
  switch (detailedIdentity.role.name) {
    case TARole.Admin:
      return true;
    case TARole.Coordinator:
      switch (action) {
        case 'edit-depth':
        case 'edit-topics':
        case 'edit-description':
        case 'edit-projected-start-date':
        case 'edit-projected-completion-date':
        case 'edit-actual-completion-date':
        case 'edit-customer':
          return true;
      }
      return false;
    case TARole.ProgramLead:
      switch (action) {
        case 'edit-depth':
        case 'edit-topics':
        case 'edit-description':
        case 'edit-projected-start-date':
        case 'edit-projected-completion-date':
        case 'edit-actual-completion-date':
        case 'edit-customer':
          return true;
      }
      return false;
    case TARole.LabLead:
      switch (action) {
        case 'edit-depth':
        case 'edit-topics':
        case 'edit-description':
        case 'edit-projected-start-date':
        case 'edit-projected-completion-date':
        case 'edit-actual-completion-date':
        case 'edit-customer':
          return true;
      }
      return false;
    case TARole.Expert:
      switch (action) {
        case 'edit-projected-start-date':
        case 'edit-projected-completion-date':
        case 'edit-actual-completion-date':
          return true;
      }
      return false;
    default:
      return false;
  }
};

/**
 * Map flow step names to their order in the system flow.
 * Note that the order of the keys in this object is important.
 * They should be in ascending order based on the number in the value.
 */
export const Steps = {
  Opened: 0,
  Reception: 1,
  Program: 2,
  Lab: 3,
  Expert: 4,
  Approval: 5,
  Completed: 6,
} as const;

/**
 * Type for the step index, which is based on the values of the Steps object.
 */
export type StepIndex = (typeof Steps)[keyof typeof Steps];

interface StepInfo {
  /**
   * Text to display on the forward action button/menu.
   */
  forwardText: string | null;
  /**
   * Whether the forward action should be a menu of options (true) or a single action (false).
   */
  forwardIsMenu?: boolean;
  /**
   * Text to display on the backward action button. Note that the backward button is always a single action.
   */
  backwardText: string | null;
  /**
   * The index of the step in the system flow. Based on the `Steps` object above and the `steps` array defined in `RequestStepper.tsx`.
   */
  stepIndex: StepIndex;
  /**
   * Array of roles that are allowed to perform the forward action.
   */
  allowedRoles: TARole[];
}

/**
 * Determine a request's current location in the system flow based on its owner and status.
 * Return the appropriate forward-action text/function, backward-action text/function,
 * and stepper index. The stepIndex is based on the `steps` var in `RequestStepper.tsx`.
 */
export const getStep = (request: TARequestDetail): StepInfo => {
  if (request.status === 'New' && !request.owner) {
    // This should technically never happen since we auto-assign to reception
    return {
      forwardText: 'Assign to reception',
      forwardIsMenu: true,
      backwardText: 'Cancel request',
      stepIndex: Steps.Opened,
      allowedRoles: [TARole.Coordinator, TARole.Admin],
    };
  } else if (request.owner?.domain_type === 'reception') {
    return {
      forwardText: 'Assign to program',
      forwardIsMenu: true,
      backwardText: 'Cancel request',
      stepIndex: Steps.Reception,
      allowedRoles: [TARole.Coordinator, TARole.Admin],
    };
  } else if (request.owner?.domain_type === 'program' && request.lab === null) {
    return {
      forwardText: 'Assign to lab',
      forwardIsMenu: true,
      backwardText: 'Assign back to reception',
      stepIndex: Steps.Program,
      allowedRoles: [TARole.ProgramLead, TARole.Admin],
    };
  } else if (request.owner?.domain_type === 'lab' && request.expert === null) {
    return {
      forwardText: 'Assign to expert',
      forwardIsMenu: true,
      backwardText: 'Assign back to program',
      stepIndex: Steps.Lab,
      allowedRoles: [TARole.LabLead, TARole.Admin],
    };
  } else if (request.owner?.domain_type === 'expert') {
    return {
      forwardText: 'Complete closeout',
      forwardIsMenu: false,
      backwardText: 'Assign back to lab',
      stepIndex: Steps.Expert,
      allowedRoles: [TARole.Expert, TARole.Admin],
    };
  } else if (request.owner?.domain_type === 'lab' && request.expert !== null) {
    return {
      forwardText: 'Approve and send to program',
      forwardIsMenu: false,
      backwardText: 'Assign back to expert',
      stepIndex: Steps.Approval,
      allowedRoles: [TARole.LabLead, TARole.Admin],
    };
  } else if (request.owner?.domain_type === 'program' && request.expert !== null) {
    return {
      forwardText: 'Approve and mark complete',
      forwardIsMenu: false,
      backwardText: 'Assign back to lab',
      stepIndex: Steps.Approval,
      allowedRoles: [TARole.ProgramLead, TARole.Admin],
    };
  } else if (
    !request.owner &&
    (request.status === 'Completed' || request.status === 'Unable to address')
  ) {
    return {
      forwardText: 'Reopen request',
      backwardText: null,
      stepIndex: Steps.Completed,
      allowedRoles: [TARole.Admin],
    };
  } else {
    // This case should never happen if the backend is correctly enforcing the flow,
    // but we return a default value just in case
    return {
      forwardText: '',
      backwardText: '',
      stepIndex: Steps.Opened,
      allowedRoles: [TARole.Admin],
    };
  }
};
