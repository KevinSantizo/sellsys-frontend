export type ReportPeriod = {
  date_from: string;
  date_to: string;
};

export type ReportMetric = {
  count: number;
  total: string;
};

export type ReportCashSummary = {
  in: ReportMetric;
  out: ReportMetric;
  net: string;
};

export type ReportSummary = {
  period: ReportPeriod;
  company_id: string;
  branch_id: string;
  sales: ReportMetric;
  purchases: ReportMetric;
  expenses: ReportMetric;
  cash: ReportCashSummary;
};

export type ReportDailyCash = {
  in: string;
  out: string;
  net: string;
};

export type ReportDailyRow = {
  date: string;
  sales: ReportMetric;
  purchases: ReportMetric;
  expenses: ReportMetric;
  cash: ReportDailyCash;
};

export type ReportDailyResponse = {
  period: ReportPeriod;
  company_id: string;
  branch_id: string;
  results: ReportDailyRow[];
};

export type ReportParams = {
  companyId: string;
  branchId: string;
  dateFrom: string;
  dateTo: string;
};

export type SalesReportSummary = {
  count: number;
  total: string;
  average_ticket: string;
};

export type SalesReportRow = {
  id: string;
  sale_number: string;
  customer_name: string;
  subtotal: string;
  discount_total: string;
  tax_total: string;
  total: string;
  completed_at: string;
};

export type SalesReportResponse = {
  period: ReportPeriod;
  company_id: string;
  branch_id: string;
  summary: SalesReportSummary;
  count: number;
  next: string | null;
  previous: string | null;
  results: SalesReportRow[];
};

export type SalesReportParams = ReportParams & {
  page: number;
  pageSize: number;
};

export type PurchasesReportSummary = {
  count: number;
  total: string;
  average_purchase: string;
};

export type PurchasesReportRow = {
  id: string;
  purchase_number: string;
  supplier_name: string;
  supplier_invoice_number: string;
  purchase_date: string;
  payment_method: string;
  payment_method_display: string;
  subtotal: string;
  discount_total: string;
  tax_total: string;
  total: string;
};

export type PurchasesReportResponse = {
  period: ReportPeriod;
  company_id: string;
  branch_id: string;
  summary: PurchasesReportSummary;
  count: number;
  next: string | null;
  previous: string | null;
  results: PurchasesReportRow[];
};

export type PurchasesReportParams = ReportParams & {
  page: number;
  pageSize: number;
};

export type ExpensesReportSummary = {
  count: number;
  total: string;
  average_expense: string;
};

export type ExpensesReportRow = {
  id: string;
  description: string;
  expense_date: string;
  payment_method: string;
  payment_method_display: string;
  supplier_name: string | null;
  reference: string;
  amount: string;
};

export type ExpensesReportResponse = {
  period: ReportPeriod;
  company_id: string;
  branch_id: string;
  summary: ExpensesReportSummary;
  count: number;
  next: string | null;
  previous: string | null;
  results: ExpensesReportRow[];
};

export type ExpensesReportParams = ReportParams & {
  page: number;
  pageSize: number;
};

export type CashReportMovementSummary = {
  count: number;
  total: string;
};

export type CashReportSummary = {
  in: CashReportMovementSummary;
  out: CashReportMovementSummary;
  net: string;
};

export type CashReportRow = {
  id: string;
  direction: string;
  direction_display: string;
  movement_type: string;
  movement_type_display: string;
  amount: string;
  source_type: string;
  reference: string;
  notes: string;
  created_at: string;
};

export type CashReportResponse = {
  period: ReportPeriod;
  company_id: string;
  branch_id: string;
  summary: CashReportSummary;
  count: number;
  next: string | null;
  previous: string | null;
  results: CashReportRow[];
};

export type CashReportParams = ReportParams & {
  page: number;
  pageSize: number;
};

export type InventoryReportSummary = {
  products: number;
  total_units: string;
  total_cost_value: string;
  total_sale_value: string;
};

export type InventoryReportRow = {
  product_id: string;
  name: string;
  sku: string;
  barcode: string | null;
  quantity: string;
  cost_price: string;
  sale_price: string;
  cost_value: string;
  sale_value: string;
};

export type InventoryReportResponse = {
  company_id: string;
  branch_id: string;
  summary: InventoryReportSummary;
  count: number;
  next: string | null;
  previous: string | null;
  results: InventoryReportRow[];
};

export type InventoryReportParams = {
  companyId: string;
  branchId: string;
  page: number;
  pageSize: number;
};

export type ProfitabilityReportSummary = {
  revenue: string;
  cost_of_sales: string | null;
  gross_profit: string | null;
  expenses: string;
  operating_result: string | null;
  gross_margin: string | null;
  missing_cost_items: number;
  cost_coverage_complete: boolean;
};

export type ProfitabilityReportRow = {
  product_id: string;
  product_name: string;
  product_sku: string;
  quantity_sold: string;
  revenue: string;
  cost_of_sales: string | null;
  gross_profit: string | null;
  gross_margin: string | null;
  cost_coverage_complete: boolean;
};

export type ProfitabilityReportResponse = {
  period: ReportPeriod;
  company_id: string;
  branch_id: string;
  summary: ProfitabilityReportSummary;
  count: number;
  next: string | null;
  previous: string | null;
  results: ProfitabilityReportRow[];
};

export type ProfitabilityReportParams = ReportParams & {
  page: number;
  pageSize: number;
};