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

export interface TATopic {
  id: number;
  name: string;
  description: string;
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

export interface TAOwner {
  id: number;
  domain_description?: string;
  domain_id?: number;
  domain_name?: string;
  domain_type: string;
}

export interface TAExpertise {
  topic: TATopic;
  depth: TADepth;
}

export interface TAExpert {
  id: number;
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
  description: string;
  date_created: string;
  customers: TACustomer[];
  expert: {
    id: number;
    email: string;
    phone: string;
  } | null;
  owner?: TAOwner;
  proj_start_date: string | null;
  proj_completion_date: string | null;
  actual_completion_date: string | null;
  topics: TATopic[];
  attachments: TAAttachment[];
}

export interface TARequestDetailMutation {
  depth: string;
  description: string;
  proj_start_date: string | null;
  proj_completion_date: string | null;
  actual_completion_date: string | null;
  topics: string[];
}

export interface TAIdentity {
  user: {
    id: number;
    email: string;
  };
  role: {
    id: number;
    name: string;
    description: string;
  };
  location: string;
  instance?: {
    id: number;
    name: string;
    description: string;
  };
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
  owner?: number;
  expert?: number;
}

export interface TAError {
  message: string | Record<string, string[]>;
}
