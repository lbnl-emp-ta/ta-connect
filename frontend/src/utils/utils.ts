import { TAIdentity, TARequestDetail, TARole, TAStatusName } from '../api/dashboard/types';

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
 * Parse a string value to a boolean.
 * Returns true if the string is "true" (case-sensitive), and false otherwise.
 * Used for radio button groups.
 */
export const parseBoolean = (value: string): boolean => value === 'true';

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
export const hasPermission = (
  action: PermissionAction,
  detailedIdentity?: TAIdentity,
  statusName?: TAStatusName
): boolean => {
  if (!detailedIdentity || !detailedIdentity.role) return false;

  // No one can edit the projected completion date unless
  // the request is currently assigned-to-expert or is already providing-ta.
  if (
    action === 'edit-projected-completion-date' &&
    statusName !== 'assigned-to-expert' &&
    statusName !== 'providing-ta'
  ) {
    return false;
  }

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
  Intake: 0,
  Assignment: 1,
  Delivery: 2,
  Review: 3,
  Completed: 4,
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
  if (!request.status && !request.owner) {
    // This should technically never happen since we auto-assign to reception
    return {
      forwardText: 'Assign to reception',
      forwardIsMenu: true,
      backwardText: 'Cancel request',
      stepIndex: Steps.Intake,
      allowedRoles: [TARole.Coordinator, TARole.Admin],
    };
  } else if (request.owner?.domain_type === 'reception') {
    return {
      forwardText: 'Assign to program',
      forwardIsMenu: true,
      backwardText: 'Cancel request',
      stepIndex: Steps.Assignment,
      allowedRoles: [TARole.Coordinator, TARole.Admin],
    };
  } else if (request.owner?.domain_type === 'program' && request.lab === null) {
    return {
      forwardText: 'Assign to lab',
      forwardIsMenu: true,
      backwardText: 'Assign back to reception',
      stepIndex: Steps.Assignment,
      allowedRoles: [TARole.ProgramLead, TARole.Admin],
    };
  } else if (request.owner?.domain_type === 'lab' && request.expert === null) {
    return {
      forwardText: 'Assign to expert',
      forwardIsMenu: true,
      backwardText: 'Assign back to program',
      stepIndex: Steps.Assignment,
      allowedRoles: [TARole.LabLead, TARole.Admin],
    };
  } else if (request.owner?.domain_type === 'expert' && request.status === 'assigned-to-expert') {
    return {
      forwardText: 'Start TA and add dates',
      forwardIsMenu: false,
      backwardText: 'Assign back to lab',
      stepIndex: Steps.Delivery,
      allowedRoles: [TARole.Expert, TARole.Admin],
    };
  } else if (request.owner?.domain_type === 'expert' && request.status === 'providing-ta') {
    return {
      forwardText: 'Start closeout process',
      forwardIsMenu: false,
      backwardText: 'Assign back to lab',
      stepIndex: Steps.Delivery,
      allowedRoles: [TARole.Expert, TARole.Admin],
    };
  } else if (request.owner?.domain_type === 'expert' && request.status === 'closeout-started') {
    return {
      forwardText: 'Continue closeout form',
      forwardIsMenu: false,
      backwardText: 'Go back to providing TA',
      stepIndex: Steps.Delivery,
      allowedRoles: [TARole.Expert, TARole.Admin],
    };
  } else if (request.owner?.domain_type === 'lab' && request.expert !== null) {
    return {
      forwardText: 'Approve and send to program',
      forwardIsMenu: false,
      backwardText: 'Assign back to expert',
      stepIndex: Steps.Review,
      allowedRoles: [TARole.LabLead, TARole.Admin],
    };
  } else if (request.owner?.domain_type === 'program' && request.expert !== null) {
    return {
      forwardText: 'Approve and mark complete',
      forwardIsMenu: false,
      backwardText: 'Assign back to expert',
      stepIndex: Steps.Review,
      allowedRoles: [TARole.ProgramLead, TARole.Admin],
    };
  } else if (
    !request.owner &&
    (request.status === 'completed' || request.status === 'unable-to-address')
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
      stepIndex: Steps.Intake,
      allowedRoles: [TARole.Admin],
    };
  }
};

interface StatusInfo {
  text: string;
  color: string;
  contrastColor: string;
}

export const statusMap: Record<TAStatusName, StatusInfo> = {
  scoping: {
    text: 'Scoping',
    color: '#444441',
    contrastColor: 'white',
  },
  'assigned-to-program': {
    text: 'Assigned to Program',
    color: '#3d6e96',
    contrastColor: 'white',
  },
  'rejected-by-program': {
    text: 'Rejected by Program',
    color: '#444441',
    contrastColor: 'white',
  },
  'assigned-to-lab': {
    text: 'Assigned to lab',
    color: '#5a52a8',
    contrastColor: 'white',
  },
  'rejected-by-lab': {
    text: 'Rejected by lab',
    color: '#3d6e96',
    contrastColor: 'white',
  },
  'assigned-to-expert': {
    text: 'Assigned to expert',
    color: '#2e7d68',
    contrastColor: 'white',
  },
  'rejected-by-expert': {
    text: 'Rejected by expert',
    color: '#5a52a8',
    contrastColor: 'white',
  },
  'providing-ta': {
    text: 'TA in progress',
    color: '#2e7d68',
    contrastColor: 'white',
  },
  'closeout-started': {
    text: 'Closeout started',
    color: '#2e7d68',
    contrastColor: 'white',
  },
  'closeout-more-info': {
    text: 'Closeout needs more info',
    color: '#2e7d68',
    contrastColor: 'white',
  },
  'closeout-review-by-lab': {
    text: 'Closeout being reviewed by lab',
    color: '#8a6d1a',
    contrastColor: 'white',
  },
  'closeout-review-by-program': {
    text: 'Closeout being reviewed by program',
    color: '#8a6d1a',
    contrastColor: 'white',
  },
  completed: {
    text: 'Completed',
    color: '#e4f2dc',
    contrastColor: '#333333',
  },
  'unable-to-address': {
    text: 'Unable to address',
    color: '#E8F0F2',
    contrastColor: '#333333',
  },
};
