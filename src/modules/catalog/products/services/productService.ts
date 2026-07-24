import { httpClient } from "../../../../api/httpClient";

import type {
  CreateProductPayload,
  GetProductsParams,
  Product,
} from "../types/product";

export async function getProducts({
  companyId,
  search,
}: GetProductsParams): Promise<Product[]> {
  const response = await httpClient.get<Product[]>(
    "catalog/products/",
    {
      params: {
        company_id: companyId,
        search: search?.trim() || undefined,
      },
    },
  );

  return response.data;
}

export async function createProduct(
  payload: CreateProductPayload,
): Promise<Product> {
  const response = await httpClient.post<Product>(
    "catalog/products/",
    payload,
  );

  return response.data;
}