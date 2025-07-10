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

export interface TAOwner {
  id: number;
  lab?: number;
  program?: number;
  reception: number;
  domain_type: string;
}

export interface TARequest {
  id: number;
  status: string;
  depth: string;
  description: string;
  date_created: string;
  customer_email: string;
  customer_name: string;
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
  owner: TAOwner;
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
