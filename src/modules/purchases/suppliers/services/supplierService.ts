import {httpClient} from "../../../../api/httpClient";

import type {
  CreateSupplierPayload,
  Supplier,
  SupplierListResponse,
  UpdateSupplierPayload,
} from "../types/supplier";
 

type GetSuppliersParams = {
  companyId: string;
  search?: string;
  isActive?: boolean;
  ordering?: string;
  page?: number;
  pageSize?: number;
};

export async function getSuppliers({
  companyId,
  search,
  isActive,
  ordering,
  page = 1,
  pageSize = 10,
}: GetSuppliersParams) {
  const response =
    await httpClient.get<SupplierListResponse>(
      "/purchases/suppliers/",
      {
        params: {
          company_id: companyId,
          search: search || undefined,
          is_active:
            isActive !== undefined
              ? isActive
              : undefined,
          ordering: ordering || undefined,
          page,
          page_size: pageSize,
        },
      },
    );

  return response.data;
}

export async function getSupplier(
  supplierId: string,
) {
  const response = await httpClient.get<Supplier>(
    `/purchases/suppliers/${supplierId}/`,
  );

  return response.data;
}

export async function createSupplier(
  payload: CreateSupplierPayload,
) {
  const response = await httpClient.post<Supplier>(
    "/purchases/suppliers/",
    payload,
  );

  return response.data;
}

export async function updateSupplier(
  supplierId: string,
  payload: UpdateSupplierPayload,
) {
  const response = await httpClient.patch<Supplier>(
    `/purchases/suppliers/${supplierId}/`,
    payload,
  );

  return response.data;
}