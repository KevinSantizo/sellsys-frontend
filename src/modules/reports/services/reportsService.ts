import { httpClient } from "../../../api/httpClient";

import type {
  CashReportParams,
  CashReportResponse,
  ExpiringProductsReportParams,
  ExpiringProductsReportResponse,
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
  const response = await httpClient.get<ReportSummary>("/reports/summary/", {
    params: {
      company_id: params.companyId,
      branch_id: params.branchId,
      date_from: params.dateFrom,
      date_to: params.dateTo,
    },
  });

  return response.data;
}

export async function getReportDaily(
  params: ReportParams,
): Promise<ReportDailyResponse> {
  const response = await httpClient.get<ReportDailyResponse>("/reports/daily/", {
    params: {
      company_id: params.companyId,
      branch_id: params.branchId,
      date_from: params.dateFrom,
      date_to: params.dateTo,
    },
  });

  return response.data;
}

export async function getSalesReport(
  params: SalesReportParams,
): Promise<SalesReportResponse> {
  const response = await httpClient.get<SalesReportResponse>("/reports/sales/", {
    params: {
      company_id: params.companyId,
      branch_id: params.branchId,
      date_from: params.dateFrom,
      date_to: params.dateTo,
      page: params.page,
      page_size: params.pageSize,
    },
  });

  return response.data;
}

export async function getPurchasesReport(
  params: PurchasesReportParams,
): Promise<PurchasesReportResponse> {
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

export async function getExpensesReport(
  params: ExpensesReportParams,
): Promise<ExpensesReportResponse> {
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

export async function getCashReport(
  params: CashReportParams,
): Promise<CashReportResponse> {
  const response = await httpClient.get<CashReportResponse>("/reports/cash/", {
    params: {
      company_id: params.companyId,
      branch_id: params.branchId,
      date_from: params.dateFrom,
      date_to: params.dateTo,
      page: params.page,
      page_size: params.pageSize,
    },
  });

  return response.data;
}

export async function getInventoryReport(
  params: InventoryReportParams,
): Promise<InventoryReportResponse> {
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

export async function getExpiringProductsReport(
  params: ExpiringProductsReportParams,
): Promise<ExpiringProductsReportResponse> {
  const response = await httpClient.get<ExpiringProductsReportResponse>(
    "/reports/expiring-products/",
    {
      params: {
        company_id: params.companyId,
        branch_id: params.branchId,
        status: params.status,
        days: params.days,
        search: params.search || undefined,
        page: params.page,
        page_size: params.pageSize,
      },
    },
  );

  return response.data;
}

export async function getProfitabilityReport(
  params: ProfitabilityReportParams,
): Promise<ProfitabilityReportResponse> {
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

type ReportExportParams = {
  companyId: string;
  branchId: string;
  dateFrom: string;
  dateTo: string;
};

type CashExportParams = ReportExportParams & {
  cashRegisterId?: string;
  movementType?: string;
  direction?: string;
  search?: string;
};

type InventoryExportParams = {
  companyId: string;
  branchId: string;
  search?: string;
  isActive?: boolean;
  categoryId?: string;
  brandId?: string;
  productType?: string;
  expirationStatus?: "UPCOMING" | "EXPIRED";
};

async function downloadReportFile(
  url: string,
  params: ReportExportParams,
  filename: string,
  extraParams?: Record<string, string | undefined>,
) {
  const response = await httpClient.get(url, {
    params: {
      company_id: params.companyId,
      branch_id: params.branchId,
      date_from: params.dateFrom,
      date_to: params.dateTo,
      ...extraParams,
    },
    responseType: "blob",
  });

  const contentType = response.headers["content-type"];
  const blob = new Blob([response.data], {
    type:
      typeof contentType === "string"
        ? contentType
        : "application/octet-stream",
  });

  const objectUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(objectUrl);
}

export async function downloadSalesExcel(params: ReportExportParams) {
  return downloadReportFile(
    "reports/sales/export/excel/",
    params,
    "ventas_" + params.dateFrom + "_" + params.dateTo + ".xlsx",
  );
}

export async function downloadSalesPdf(params: ReportExportParams) {
  return downloadReportFile(
    "reports/sales/export/pdf/",
    params,
    "ventas_" + params.dateFrom + "_" + params.dateTo + ".pdf",
  );
}

export async function downloadPurchasesExcel(params: ReportExportParams) {
  return downloadReportFile(
    "reports/purchases/export/excel/",
    params,
    "compras_" + params.dateFrom + "_" + params.dateTo + ".xlsx",
  );
}

export async function downloadPurchasesPdf(params: ReportExportParams) {
  return downloadReportFile(
    "reports/purchases/export/pdf/",
    params,
    "compras_" + params.dateFrom + "_" + params.dateTo + ".pdf",
  );
}

export async function downloadExpensesExcel(params: ReportExportParams) {
  return downloadReportFile(
    "reports/expenses/export/excel/",
    params,
    "gastos_" + params.dateFrom + "_" + params.dateTo + ".xlsx",
  );
}

export async function downloadExpensesPdf(params: ReportExportParams) {
  return downloadReportFile(
    "reports/expenses/export/pdf/",
    params,
    "gastos_" + params.dateFrom + "_" + params.dateTo + ".pdf",
  );
}

export async function downloadProfitabilityExcel(
  params: ReportExportParams,
) {
  return downloadReportFile(
    "reports/profitability/export/excel/",
    params,
    "rentabilidad_" + params.dateFrom + "_" + params.dateTo + ".xlsx",
  );
}

export async function downloadProfitabilityPdf(
  params: ReportExportParams,
) {
  return downloadReportFile(
    "reports/profitability/export/pdf/",
    params,
    "rentabilidad_" + params.dateFrom + "_" + params.dateTo + ".pdf",
  );
}

export async function downloadCashExcel(params: CashExportParams) {
  return downloadReportFile(
    "reports/cash/export/excel/",
    params,
    "movimientos_caja_" + params.dateFrom + "_" + params.dateTo + ".xlsx",
    {
      cash_register_id: params.cashRegisterId,
      movement_type: params.movementType,
      direction: params.direction,
      search: params.search,
    },
  );
}

export async function downloadCashPdf(params: CashExportParams) {
  return downloadReportFile(
    "reports/cash/export/pdf/",
    params,
    "movimientos_caja_" + params.dateFrom + "_" + params.dateTo + ".pdf",
    {
      cash_register_id: params.cashRegisterId,
      movement_type: params.movementType,
      direction: params.direction,
      search: params.search,
    },
  );
}

async function downloadInventoryReportFile(
  url: string,
  params: InventoryExportParams,
  filename: string,
) {
  const response = await httpClient.get(url, {
    params: {
      company_id: params.companyId,
      branch_id: params.branchId,
      search: params.search,
      is_active: params.isActive,
      category_id: params.categoryId,
      brand_id: params.brandId,
      product_type: params.productType,
      expiration_status: params.expirationStatus,
    },
    responseType: "blob",
  });

  const contentType = response.headers["content-type"];
  const blob = new Blob([response.data], {
    type:
      typeof contentType === "string"
        ? contentType
        : "application/octet-stream",
  });

  const objectUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(objectUrl);
}

export async function downloadInventoryExcel(
  params: InventoryExportParams,
) {
  return downloadInventoryReportFile(
    "reports/inventory/export/excel/",
    params,
    "inventario_actual.xlsx",
  );
}

export async function downloadInventoryPdf(
  params: InventoryExportParams,
) {
  return downloadInventoryReportFile(
    "reports/inventory/export/pdf/",
    params,
    "inventario_actual.pdf",
  );
}
