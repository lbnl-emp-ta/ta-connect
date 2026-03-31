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
    type: {
      id: number;
      name: string;
      description: string;
    };
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
  expertise: TAExpertise[];
}

export interface TAAttachment {
  id: number;
  title: string;
  description?: string;
  uploaded_at: string;
}

export interface TARequest {
  id: number;
  status: string;
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
  status: string;
  depth: string;
  depth_options: string[];
  description: string;
  date_created: string;
  customers: TACustomer[];
  expert: {
    id: number;
    email: string;
    phone: string;
  } | null;
  owner?: TAOwner;
  program?: string | null;
  lab?: string | null;
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
  owner: number;
}

export interface TAError {
  message: string | Record<string, string[]>;
}
