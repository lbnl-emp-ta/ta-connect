export interface State {
  id: number;
  name: string;
  abbreviation: string;
}

export interface OrganizationType {
  id: number;
  name: string;
  description: string;
}

export interface Organization {
  id: number;
  name: string;
  address: string;
  type: OrganizationType;
}

export interface TransmissionPlanningRegion {
  id: number;
  name: string;
}

export interface IntakeFormData {
  name: string;
  email: string;
  phone: string;
  title: string;
  tpr: string;
  state: string;
  organization: string;
  organizationAddress: string;
  organizationType: string;
  taDepth: string;
  description: string;
}
