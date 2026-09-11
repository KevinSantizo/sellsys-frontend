export type Supplier = {
  id: string;
  name: string;
  tax_id: string;
  contact_name: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type CreateSupplierPayload = {
  company_id: string;
  name: string;
  tax_id: string;
  contact_name: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
  is_active: boolean;
};

export type UpdateSupplierPayload = Omit<
  CreateSupplierPayload,
  "company_id"
>;

export type SupplierListResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: Supplier[];
};

export type SupplierFormValues = {
  name: string;
  tax_id: string;
  contact_name: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
  is_active: boolean;
};