export type PurchaseStatus =
  | "DRAFT"
  | "COMPLETED"
  | "CANCELLED";

export type PurchasePaymentMethod =
  | "CASH"
  | "TRANSFER"
  | "CARD"
  | "SUPPLIER_CREDIT"
  | "OTHER";

export type PurchaseItem = {
  id: string;
  product_id: string;
  product_name: string;
  product_sku: string;
  quantity: string;
  unit_cost: string;
  subtotal: string;
  created_at: string;
  updated_at: string;
  lot_number: string;
  expiration_date: string | null;
};

export type Purchase = {
  id: string;

  company_id: string;
  company_name: string;

  branch_id: string;
  branch_name: string;

  supplier_id: string;
  supplier_name: string;

  purchase_number: string;
  supplier_invoice_number: string;
  purchase_date: string;

  payment_method: PurchasePaymentMethod;
  payment_method_display: string;

  status: PurchaseStatus;
  status_display: string;

  subtotal: string;
  discount_total: string;
  tax_total: string;
  total: string;

  notes: string;

  items: PurchaseItem[];

  created_by_name: string | null;

  completed_at: string | null;
  cancelled_at: string | null;

  created_at: string;
  updated_at: string;
};

export type PurchaseListResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: Purchase[];
};

export type PurchaseItemFormValues = {
  product_id: string;
  quantity: string;
  unit_cost: string;
  sale_price: string;
  lot_number: string;
  expiration_date: string;
};

export type PurchaseFormValues = {
  supplier_id: string;
  supplier_invoice_number: string;
  purchase_date: string;
  payment_method: PurchasePaymentMethod;
  discount_total: string;
  tax_total: string;
  notes: string;
  items: PurchaseItemFormValues[];
};

export type CreatePurchasePayload = {
  company_id: string;
  branch_id: string;
  supplier_id: string;
  supplier_invoice_number: string;
  purchase_date: string;
  payment_method: PurchasePaymentMethod;
  discount_total: string;
  tax_total: string;
  notes: string;
  items: PurchaseItemFormValues[];
};

export type UpdatePurchasePayload = {
  supplier_id: string;
  supplier_invoice_number: string;
  purchase_date: string;
  payment_method: PurchasePaymentMethod;
  discount_total: string;
  tax_total: string;
  notes: string;
  items: PurchaseItemPayload[];
};

export type PurchaseStatusFilter =
  | "ALL"
  | PurchaseStatus;

export type PurchasePaymentMethodFilter =
  | "ALL"
  | PurchasePaymentMethod;


export type PurchaseItemPayload = {
  product_id: string;
  quantity: string;
  unit_cost: string;
  sale_price: string;
  lot_number: string;
  expiration_date: string | null;
};