export type CashSessionStatus = "OPEN" | "CLOSED";

export type CashMovementDirection = "IN" | "OUT";

export type CashMovementType =
  | "SALE"
  | "EXPENSE"
  | "PURCHASE"
  | "MANUAL_IN"
  | "MANUAL_OUT"
  | "REVERSAL";

export type CashMovementSource =
  | "SALE"
  | "EXPENSE"
  | "PURCHASE"
  | "MANUAL";

export type CashRegister = {
  id: string;
  company_id: string;
  company_name: string;
  branch_id: string;
  branch_name: string;
  name: string;
  code: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type CashSession = {
  id: string;
  company_id: string;
  company_name: string;
  branch_id: string;
  branch_name: string;
  cash_register_id: string;
  cash_register_name: string;
  cash_register_code: string;
  status: CashSessionStatus;
  status_display: string;
  opening_amount: string;
  expected_amount: string | null;
  counted_amount: string | null;
  difference: string | null;
  opened_by_name: string | null;
  closed_by_name: string | null;
  opened_at: string;
  closed_at: string | null;
  notes: string;
  created_at: string;
  updated_at: string;
};

export type CashMovement = {
  id: string;
  company_id: string;
  branch_id: string;
  cash_session_id: string;
  cash_register_id: string;
  cash_register_name: string;
  cash_register_code: string;
  direction: CashMovementDirection;
  direction_display: string;
  movement_type: CashMovementType;
  movement_type_display: string;
  amount: string;
  source_type: CashMovementSource | null;
  source_id: string | null;
  reference: string;
  notes: string;
  created_by_name: string | null;
  created_at: string;
};

export type CreateCashRegisterPayload = {
  company_id: string;
  branch_id: string;
  name: string;
  code: string;
  is_active: boolean;
};

export type UpdateCashRegisterPayload = {
  name?: string;
  code?: string;
  is_active?: boolean;
};

export type OpenCashSessionPayload = {
  company_id: string;
  branch_id: string;
  cash_register_id: string;
  opening_amount: string;
  notes?: string;
};

export type CloseCashSessionPayload = {
  counted_amount: string;
  notes?: string;
};

export type ManualCashMovementPayload = {
  cash_session_id: string;
  direction: CashMovementDirection;
  amount: string;
  reference?: string;
  notes?: string;
};

export type CashRegistersParams = {
  companyId: string;
  branchId?: string;
  isActive?: boolean;
  search?: string;
  ordering?: string;
  page?: number;
  pageSize?: number;
};

export type CashSessionsParams = {
  companyId: string;
  branchId?: string;
  cashRegisterId?: string;
  status?: CashSessionStatus;
  ordering?: string;
  page?: number;
  pageSize?: number;
};

export type CashMovementsParams = {
  companyId?: string;
  branchId?: string;
  cashSessionId?: string;
  cashRegisterId?: string;
  direction?: CashMovementDirection;
  movementType?: CashMovementType;
  sourceType?: CashMovementSource;
  search?: string;
  ordering?: string;
  page?: number;
  pageSize?: number;
};

export type CashRegisterListResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: CashRegister[];
};

export type CashSessionListResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: CashSession[];
};

export type CashMovementListResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: CashMovement[];
};

export type CashRegisterFormValues = {
  name: string;
  code: string;
  is_active: boolean;
};

export type CashSessionSummary = {
  session_id: string;
  cash_register_id: string;
  cash_register_name: string;
  status: CashSessionStatus;
  status_display: string;
  opening_amount: string;
  total_in: string;
  total_out: string;
  expected_amount: string;
};