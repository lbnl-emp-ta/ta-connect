export interface TARequest {
  id: number;
  status: string;
  depth: string;
  description: string;
  date_created: string;
  proj_start_date: string | null;
  proj_end_date: string | null;
  actual_completion_date: string | null;
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
