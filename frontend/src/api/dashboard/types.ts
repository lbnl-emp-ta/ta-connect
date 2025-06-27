export interface TACustomer {
  id: number;
  email: string;
  name: string;
  phone: string;
  title: string;
  org: number;
  state: number;
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
  proj_end_date: string | null;
  actual_completion_date: string | null;
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
  proj_end_date: string | null;
  actual_completion_date: string | null;
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
