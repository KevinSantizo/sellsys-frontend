import { httpClient } from "../../../api/httpClient";

import type {
  CheckoutSalePayload,
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

  const pdfUrl =
    URL.createObjectURL(
      pdfBlob,
    );

  const iframe =
    document.createElement(
      "iframe",
    );

  iframe.style.position =
    "fixed";

  iframe.style.right = "0";
  iframe.style.bottom = "0";

  iframe.style.width = "0";
  iframe.style.height = "0";

  iframe.style.border = "0";

  iframe.src = pdfUrl;

  document.body.appendChild(
    iframe,
  );

  iframe.onload = () => {
    const iframeWindow =
      iframe.contentWindow;

    if (!iframeWindow) {
      URL.revokeObjectURL(
        pdfUrl,
      );

      iframe.remove();
      return;
    }

    iframeWindow.focus();
    iframeWindow.print();

    window.setTimeout(() => {
      URL.revokeObjectURL(
        pdfUrl,
      );

      iframe.remove();
    }, 1000);
  };
}