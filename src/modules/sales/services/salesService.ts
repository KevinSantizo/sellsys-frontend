import { httpClient } from "../../../api/httpClient";

import type {
  CheckoutSalePayload,
  SaleDetail,
} from "../types/sales.types";

export async function checkoutSale(
  payload: CheckoutSalePayload,
): Promise<SaleDetail> {
  const response =
    await httpClient.post<SaleDetail>(
      "sales/checkout/",
      payload,
    );

  return response.data;
}