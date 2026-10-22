import { httpClient } from "../../../api/httpClient";

import type {
  CheckoutSalePayload,
  SaleDetail,
} from "../types/sales.types";

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