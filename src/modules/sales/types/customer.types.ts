export type Customer = {
  id: string;
  company: string;
  company_name?: string;
  first_name: string;
  last_name: string;
  phone: string;
  created_at: string;
  updated_at: string;
};

export type CustomerFormValues = {
  first_name: string;
  last_name: string;
  phone: string;
};

export type CreateCustomerPayload = {
  company: string;
  first_name: string;
  last_name: string;
  phone: string;
};

export type CustomersResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: Customer[];
};