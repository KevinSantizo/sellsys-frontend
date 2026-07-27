export type SaleStatus =
  | "DRAFT"
  | "COMPLETED"
  | "CANCELLED";

export type PaymentMethod =
  | "CASH"
  | "CARD"
  | "TRANSFER";

export type SaleItemInput = {
  product_id: string;
  quantity: string;
  discount_percent: string;
};

export type PaymentInput = {
  method: PaymentMethod;
  amount: string;
  reference: string;
};

export type CheckoutSalePayload = {
  company_id: string;
  branch_id: string;
  customer_name: string;
  customer_tax_id: string;
  notes: string;
  items: SaleItemInput[];
  payments: PaymentInput[];
};

export type SaleItem = {
  id: string;
  product_id: string;
  product_name: string;
  product_sku: string;
  quantity: string;
  unit_price: string;
  discount_percent: string;
  discount_amount: string;
  line_subtotal: string;
  line_total: string;
  created_at: string;
};

export type SalePayment = {
  id: string;
  method: PaymentMethod;
  method_display: string;
  amount: string;
  reference: string;
  created_at: string;
};

export type SaleDetail = {
  id: string;
  sale_number: string;

  company: string;
  company_name: string;

  branch: string;
  branch_name: string;

  status: SaleStatus;
  status_display: string;

  customer_name: string;
  customer_tax_id: string;

  subtotal: string;
  discount_total: string;
  tax_total: string;
  total: string;

  amount_received: string;
  change_amount: string;

  notes: string;

  created_by_name: string | null;

  completed_at: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;

  items: SaleItem[];
  payments: SalePayment[];
};