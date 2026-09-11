export type ExpenseStatus =
  | "DRAFT"
  | "COMPLETED"
  | "CANCELLED";

export type ExpensePaymentMethod =
  | "CASH"
  | "TRANSFER"
  | "CARD"
  | "OTHER";


export type ExpenseCategory = {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};


export type ExpenseCategoryListResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: ExpenseCategory[];
};


export type Expense = {
    id: string;
    category_id: string; 
    supplier_id: | string | null;
    branch_name: string; 
    category_name: string; 
    supplier_name: | string | null;
    description: string;
    amount: string;
    expense_date: string;
    payment_method: ExpensePaymentMethod;
    payment_method_display: string;
    reference: string;
    notes: string;
    status: ExpenseStatus;
    status_display: string;
    created_by_name: | string | null;
    created_at: string;
    updated_at: string;
};


export type ExpenseListResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: Expense[];
};


export type ExpenseFormValues = {
  category_id: string;

  supplier_id: string;

  description: string;

  amount: string;

  expense_date: string;

  payment_method:
    ExpensePaymentMethod;

  reference: string;

  notes: string;
};


export type CreateExpensePayload = {
  company_id: string;

  branch_id: string;

  category_id: string;

  supplier_id:
    | string
    | null;

  description: string;

  amount: string;

  expense_date: string;

  payment_method:
    ExpensePaymentMethod;

  reference: string;

  notes: string;
};


export type UpdateExpensePayload = {
  category_id: string;

  supplier_id:
    | string
    | null;

  description: string;

  amount: string;

  expense_date: string;

  payment_method:
    ExpensePaymentMethod;

  reference: string;

  notes: string;
};