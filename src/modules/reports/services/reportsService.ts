import { httpClient } from "../../../api/httpClient";

import type {
    CashReportParams,
    CashReportResponse,
    ExpensesReportParams,
    ExpensesReportResponse,
    InventoryReportParams,
    InventoryReportResponse,
    ProfitabilityReportParams,
    ProfitabilityReportResponse,
    PurchasesReportParams,
    PurchasesReportResponse,
    ReportDailyResponse,
    ReportParams,
    ReportSummary,
    SalesReportParams,
    SalesReportResponse,
} from "../types/reports";

export async function getReportSummary(
  params: ReportParams,
): Promise<ReportSummary> {
  const response = await httpClient.get<ReportSummary>(
    "/reports/summary/",
    {
      params: {
        company_id: params.companyId,
        branch_id: params.branchId,
        date_from: params.dateFrom,
        date_to: params.dateTo,
      },
    },
  );

  return response.data;
}


export async function getReportDaily(
  params: ReportParams,
): Promise<ReportDailyResponse> {
  const response = await httpClient.get<ReportDailyResponse>(
    "/reports/daily/",
    {
      params: {
        company_id: params.companyId,
        branch_id: params.branchId,
        date_from: params.dateFrom,
        date_to: params.dateTo,
      },
    },
  );

  return response.data;
}

export async function getSalesReport(
  params: SalesReportParams,
): Promise<SalesReportResponse> {
  const response = await httpClient.get<SalesReportResponse>(
    "/reports/sales/",
    {
      params: {
        company_id: params.companyId,
        branch_id: params.branchId,
        date_from: params.dateFrom,
        date_to: params.dateTo,
        page: params.page,
        page_size: params.pageSize,
      },
    },
  );

  return response.data;
}

export async function getPurchasesReport(params: PurchasesReportParams): Promise<PurchasesReportResponse> {
  const response = await httpClient.get<PurchasesReportResponse>(
    "/reports/purchases/",
    {
      params: {
        company_id: params.companyId,
        branch_id: params.branchId,
        date_from: params.dateFrom,
        date_to: params.dateTo,
        page: params.page,
        page_size: params.pageSize,
      },
    },
  );

  return response.data;
}

export async function getExpensesReport(params: ExpensesReportParams): Promise<ExpensesReportResponse> {
  const response = await httpClient.get<ExpensesReportResponse>(
    "/reports/expenses/",
    {
      params: {
        company_id: params.companyId,
        branch_id: params.branchId,
        date_from: params.dateFrom,
        date_to: params.dateTo,
        page: params.page,
        page_size: params.pageSize,
      },
    },
  );

  return response.data;
}

export async function getCashReport(params: CashReportParams): Promise<CashReportResponse> {
  const response = await httpClient.get<CashReportResponse>(
    "/reports/cash/",
    {
      params: {
        company_id: params.companyId,
        branch_id: params.branchId,
        date_from: params.dateFrom,
        date_to: params.dateTo,
        page: params.page,
        page_size: params.pageSize,
      },
    },
  );

  return response.data;
}

export async function getInventoryReport(params: InventoryReportParams): Promise<InventoryReportResponse> {
  const response = await httpClient.get<InventoryReportResponse>(
    "/reports/inventory/",
    {
      params: {
        company_id: params.companyId,
        branch_id: params.branchId,
        page: params.page,
        page_size: params.pageSize,
      },
    },
  );

  return response.data;
}

export async function getProfitabilityReport(params: ProfitabilityReportParams): Promise<ProfitabilityReportResponse> {
  const response = await httpClient.get<ProfitabilityReportResponse>(
    "/reports/profitability/",
    {
      params: {
        company_id: params.companyId,
        branch_id: params.branchId,
        date_from: params.dateFrom,
        date_to: params.dateTo,
        page: params.page,
        page_size: params.pageSize,
      },
    },
  );

  return response.data;
}