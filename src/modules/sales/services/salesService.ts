import { httpClient } from "../../../api/httpClient";

import type {
  AccountsReceivableResponse,
  CheckoutSalePayload,
  PaymentMethod,
  SaleDetail,
  SalesResponse,
} from "../types/sales.types";

export type GetSalesParams = {
  companyId: string;
  branchId: string;

  search?: string;
  status?: string;

  ordering?: string;

  page?: number;
  pageSize?: number;
};

export type AddSalePaymentPayload = {
  method: PaymentMethod;
  amount: string;
  reference?: string;
  cash_session_id?: string | null;
};

export type AccountsReceivableExportParams = {
  companyId: string;
  branchId: string;
  customerId?: string;
  search?: string;
};


export type GetAccountsReceivableParams = {
  companyId: string;
  branchId: string;
  customerId?: string;
  search?: string;
  ordering?: string;
  page?: number;
  pageSize?: number;
};

export async function checkoutSale(
payload: CheckoutSalePayload, checkoutIdempotencyKey: string,
): Promise<SaleDetail> {
  const response = await httpClient.post<SaleDetail>(
    "sales/checkout/",
    payload,
    {
      headers: {
        "Idempotency-Key": checkoutIdempotencyKey,
      },
    },
  );

  return response.data;
}

export async function downloadSaleReceipt(saleId: string, saleNumber: string): Promise<void> {
  const response = await httpClient.get(
    `sales/${saleId}/receipt/`,
    {
      responseType: "blob",
    },
  );

  const blob = new Blob(
    [response.data],
    {
      type: "application/pdf",
    },
  );

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `comprobante-${saleNumber}.pdf`;

  document.body.appendChild(link);

  link.click();
  link.remove();

  window.URL.revokeObjectURL(url);
}

export async function getSales(
  params: GetSalesParams,
): Promise<SalesResponse> {
  const response = await httpClient.get<SalesResponse>(
    "/sales/",
    {
      params: {
        company_id: params.companyId,
        branch_id: params.branchId,
        search: params.search,
        status: params.status,
        ordering: params.ordering,
        page: params.page,
        page_size: params.pageSize,
      },
    },
  );

  return response.data;
}

export async function getAccountsReceivable(params: GetAccountsReceivableParams):  Promise<AccountsReceivableResponse> {
  const response = await httpClient.get<AccountsReceivableResponse>(
    "/sales/accounts-receivable/",
    {
      params: {
        company_id: params.companyId,
        branch_id: params.branchId,
        customer_id: params.customerId,
        search: params.search,
        ordering: params.ordering,
        page: params.page,
        page_size: params.pageSize,
      },
    },
  );

  return response.data;
}

export async function getSaleDetail(
  saleId: string,
): Promise<SaleDetail> {
  const response = await httpClient.get<SaleDetail>(
    `/sales/${saleId}/`,
  );

  return response.data;
}

export async function printSaleReceipt(
  saleId: string,
): Promise<void> {
  const isStandalone =
    window.matchMedia(
      "(display-mode: standalone)",
    ).matches ||
    Boolean(
      (
        navigator as Navigator & {
          standalone?: boolean;
        }
      ).standalone,
    );

  const previewWindow = isStandalone
    ? window.open("", "_blank")
    : null;

  try {
    const response = await httpClient.get(
      `/sales/${saleId}/receipt/`,
      {
        responseType: "blob",
      },
    );

    const pdfBlob = new Blob(
      [response.data],
      {
        type: "application/pdf",
      },
    );

    const pdfUrl = URL.createObjectURL(
      pdfBlob,
    );

    if (isStandalone) {
      if (previewWindow) {
        previewWindow.location.href = pdfUrl;
      } else {
        const link = document.createElement("a");

        link.href = pdfUrl;
        link.target = "_blank";
        link.rel = "noopener";

        document.body.appendChild(link);
        link.click();
        link.remove();
      }

      window.setTimeout(() => {
        URL.revokeObjectURL(pdfUrl);
      }, 60_000);

      return;
    }

    const iframe = document.createElement("iframe");

    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    iframe.allow = "modals";
    iframe.src = pdfUrl;

    document.body.appendChild(iframe);

    iframe.onload = () => {
      const iframeWindow = iframe.contentWindow;

      if (!iframeWindow) {
        URL.revokeObjectURL(pdfUrl);
        iframe.remove();
        return;
      }

      iframeWindow.focus();
      iframeWindow.print();

      window.setTimeout(() => {
        URL.revokeObjectURL(pdfUrl);
        iframe.remove();
      }, 1_000);
    };
  } catch (error) {
    previewWindow?.close();
    throw error;
  }
}

export async function cancelSale(saleId: string) {
  const response = await httpClient.post(
    `sales/${saleId}/cancel/`,
    {},
  );

  return response.data;
}

async function downloadAccountsReceivableFile(
  url: string,
  params: AccountsReceivableExportParams,
  filename: string,
): Promise<void> {
  const response = await httpClient.get(
    url,
    {
      params: {
        company_id: params.companyId,
        branch_id: params.branchId,
        customer_id: params.customerId,
        search: params.search,
      },
      responseType: "blob",
    },
  );

  const contentType =
    response.headers["content-type"];

  const blob = new Blob(
    [response.data],
    {
      type:
        typeof contentType === "string"
          ? contentType
          : "application/octet-stream",
    },
  );

  const objectUrl =
    window.URL.createObjectURL(blob);

  const link =
    document.createElement("a");

  link.href = objectUrl;
  link.download = filename;

  document.body.appendChild(link);
  link.click();
  link.remove();

  window.URL.revokeObjectURL(objectUrl);
}


export async function downloadAccountsReceivableExcel(
  params: AccountsReceivableExportParams,
): Promise<void> {
  return downloadAccountsReceivableFile(
    "reports/accounts-receivable/export/excel/",
    params,
    "cuentas_por_cobrar.xlsx",
  );
}

export async function downloadAccountsReceivablePdf(
  params: AccountsReceivableExportParams,
): Promise<void> {
  return downloadAccountsReceivableFile(
    "reports/accounts-receivable/export/pdf/",
    params,
    "cuentas_por_cobrar.pdf",
  );
}


export async function addSalePayment(
  saleId: string,
  payload: AddSalePaymentPayload,
): Promise<SaleDetail> {
  const response =
    await httpClient.post<SaleDetail>(
      `/sales/${saleId}/payments/`,
      payload,
    );

  return response.data;
}