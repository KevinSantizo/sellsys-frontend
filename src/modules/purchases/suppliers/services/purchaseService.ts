import {httpClient} from "../../../../api/httpClient";

import type {
  CreatePurchasePayload,
  Purchase,
  PurchaseListResponse,
  PurchasePaymentMethod,
  PurchaseStatus,
  UpdatePurchasePayload,
} from "../types/purchase";

type GetPurchasesParams = {
  companyId: string;
  branchId?: string;
  supplierId?: string;
  status?: PurchaseStatus;
  paymentMethod?: PurchasePaymentMethod;
  search?: string;
  ordering?: string;
  page?: number;
  pageSize?: number;
};

export async function getPurchases({
  companyId,
  branchId,
  supplierId,
  status,
  paymentMethod,
  search,
  ordering = "-purchase_date",
  page = 1,
  pageSize = 10,
}: GetPurchasesParams): Promise<PurchaseListResponse> {
  const response = await httpClient.get<PurchaseListResponse>(
    "/purchases/",
    {
      params: {
        company_id: companyId,
        branch_id: branchId || undefined,
        supplier_id: supplierId || undefined,
        status: status || undefined,
        payment_method: paymentMethod || undefined,
        search: search?.trim() || undefined,
        ordering,
        page,
        page_size: pageSize,
      },
    },
  );

  return response.data;
}

export async function getPurchase(purchaseId: string): Promise<Purchase> {
  const response = await httpClient.get<Purchase>(
    `/purchases/${purchaseId}/`,
  );

  return response.data;
}

export async function createPurchase(payload: CreatePurchasePayload): Promise<Purchase> {
  const response = await httpClient.post<Purchase>(
    "/purchases/",
    payload,
  );

  return response.data;
}

export async function updatePurchase(
  purchaseId: string,
  payload: UpdatePurchasePayload,
): Promise<Purchase> {
  const response = await httpClient.patch<Purchase>(
    `/purchases/${purchaseId}/`,
    payload,
  );

  return response.data;
}

export async function completePurchase(purchaseId: string): Promise<Purchase> {
  const response = await httpClient.post<Purchase>(
    `/purchases/${purchaseId}/complete/`,
  );

  return response.data;
}

export async function cancelPurchase(purchaseId: string): Promise<Purchase> {
  const response = await httpClient.post<Purchase>(
    `/purchases/${purchaseId}/cancel/`,
  );

  return response.data;
}