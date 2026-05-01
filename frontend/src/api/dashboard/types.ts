export interface TAOrganizationType {
  id: number;
  name: string;
  description: string;
}

export interface TACustomer {
  id: number;
  email: string;
  name: string;
  phone: string;
  title: string;
  org: {
    id: number;
    address: string;
    name: string;
    type: TAOrganizationType;
  };
  state: {
    id: number;
    name: string;
    abbreviation: string;
  };
  tpr: {
    id: number;
    name: string;
  };
  requests: number[];
}

export interface TACustomerMutation {
  org?: number;
  orgType?: number;
  tpr?: number;
  email?: string;
  name?: string;
  phone?: string;
  title?: string;
  state?: number;
}

export interface TATopic {
  id: number;
  name: string;
  description: string;
}

export interface TAAuditHistoryItem {
  action_type: string;
  date: string;
  description: string;
  role: string;
  user: string;
}

export interface TANote {
  id: number;
  content: string;
  timestamp: string;
  author?: number;
  author_name: string;
  request: number;
}

export interface TADepth {
  id: number;
  name: string;
  description: string;
}

export type TADomainType = 'reception' | 'program' | 'lab' | 'expert';

export interface TAOwner {
  id: number;
  domain_description?: string;
  domain_id?: number;
  domain_name?: string;
  domain_type: TADomainType;
  domain_organization_types?: TAOrganizationType[];
}

export interface TAExpertise {
  topic: TATopic;
  depth: TADepth;
}

export interface TAExpert {
  id: number;
  owner_id: number;
  email: string;
  name: string;
  expertises: TAExpertise[];
  lab?: TALab;
  active_requests_count?: number;
  total_requests_count?: number;
}

export interface TAProgram {
  id: number;
  depths: number[];
  description: string;
  filtered_orgs: number[];
  labs: number[];
  name: string;
  owner_id: number;
  topics: TATopic[];
}

export interface TALab {
  id: number;
  description: string;
  name: string;
  owner_id: number;
}

export interface TAAttachment {
  id: number;
  title: string;
  description?: string;
  uploaded_at: string;
}

export type TAStatusName =
  | 'scoping'
  | 'assigned-to-program'
  | 'rejected-by-program'
  | 'assigned-to-lab'
  | 'rejected-by-lab'
  | 'assigned-to-expert'
  | 'rejected-by-expert'
  | 'providing-ta'
  | 'closeout-started'
  | 'closeout-more-info'
  | 'closeout-review-by-lab'
  | 'closeout-review-by-program'
  | 'completed'
  | 'unable-to-address';

export interface TACloseoutForm {
  request: number;
  submitted_date: string;
  approved_by_lab: boolean;
  approved_by_program: boolean;
  experience_description?: string;
  ta_provided_description?: string;
  impact_description?: string;
  alignment_description?: string;
  customer_feedback?: string;
  follow_up_needed?: boolean;
  follow_up_description?: string;
  follow_up_duration?: string;
  follow_up_comments?: string;
  follow_up_has_same_expert?: boolean;
  questions?: {
    [key: string]: string;
  };
}

export interface TARequest {
  id: number;
  status: TAStatusName;
  depth: string;
  description: string;
  date_created: string;
  customer_email: string;
  customer_name: string;
  customer_state_abbreviation: string;
  expert: Partial<TAExpert> | null;
  proj_start_date: string | null;
  proj_completion_date: string | null;
  actual_completion_date: string | null;
}

export interface TAStatus {
  id: number;
  name: string;
  description: string;
}

export interface TARequestDetail {
  id: number;
  status: TAStatusName;
  depth: string;
  depth_options: string[];
  description: string;
  date_created: string;
  customers: TACustomer[];
  expert: TAExpert | null;
  owner?: TAOwner;
  program?: TAProgram | null;
  lab?: TALab | null;
  proj_start_date: string | null;
  proj_completion_date: string | null;
  actual_completion_date: string | null;
  topics: TATopic[];
  attachments: TAAttachment[];
  audit_history: TAAuditHistoryItem[];
}

export interface TARequestDetailMutation {
  depth: string;
  description: string;
  proj_start_date: string | null;
  proj_completion_date: string | null;
  actual_completion_date: string | null;
  topics: string[];
}

export enum TARole {
  Admin = 'Admin',
  Coordinator = 'Coordinator',
  Expert = 'Expert',
  LabLead = 'Lab Lead',
  ProgramLead = 'Program Lead',
}

export interface TAIdentity {
  user: {
    id: number;
    email: string;
  };
  role: {
    id: number;
    name: TARole;
    description: string;
  };
  location: string;
  instance?: {
    id: number;
    name: string;
    description: string;
  };
  program?: TAProgram;
}

export interface TAUser {
  display: string;
  has_usable_password: boolean;
  id: number;
  email?: string;
  name?: string;
  phone?: string;
}

export interface TAUserMutation {
  email?: string;
  name?: string;
  phone?: string;
}

export interface TARequestsResponse {
  actionable: TARequest[];
  downstream: TARequest[];
  inactive: TARequest[];
}

export interface Customer {
  id: number;
  email: string;
  name: string;
  phone: string;
  title: string;
}

export interface CustomerType {
  id: number;
  name: string;
  description: string;
}

export interface CustomerRequestRelationship {
  id: number;
  request: TARequest;
  customer: Customer;
  customer_type: CustomerType;
}

export interface TAAssignment {
  request: number;
  owner: number | null;
}

export interface TAError {
  message: string | Record<string, string[]>;
}
