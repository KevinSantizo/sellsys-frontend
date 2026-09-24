import { httpClient } from "../../../../api/httpClient";

import type {
  BrandDetail,
  BrandListResponse,
  BrandsParams,
  CreateBrandPayload,
  UpdateBrandPayload,
} from "../types/brand";

export async function getBrands(params: BrandsParams) {
  const response = await httpClient.get<BrandListResponse>(
    "/catalog/brands/",
    {
      params: {
        company_id: params.companyId,
        search: params.search,
        is_active: params.isActive,
        ordering: params.ordering,
        page: params.page ?? 1,
        page_size: params.pageSize ?? 10,
      },
    },
  );

  return response.data;
}

export async function getBrand(id: string) {
  const response = await httpClient.get<BrandDetail>(
    `/catalog/brands/${id}/`,
  );

  return response.data;
}

export async function createBrand(payload: CreateBrandPayload) {
  const response = await httpClient.post<BrandDetail>(
    "/catalog/brands/",
    payload,
  );

  return response.data;
}

export async function updateBrand(id: string, payload: UpdateBrandPayload) {
  const response = await httpClient.patch<BrandDetail>(
    `/catalog/brands/${id}/`,
    payload,
  );

  return response.data;
}

export async function deleteBrand(id: string) {
  await httpClient.delete(
    `/catalog/brands/${id}/`,
  );
}