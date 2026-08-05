import { httpClient } from "../../../../api/httpClient";

import type {
  CreateProductPayload,
  GetProductsParams,
  PaginatedProductsResponse,
  ProductDetail,
  UpdateProductPayload,
} from "../types/product";

export async function getProducts({
  companyId,
  branchId,
  search,
  page,
  pageSize,
  isActive,
  categoryId,
  brandId,
  productType,
}: GetProductsParams): Promise<PaginatedProductsResponse> {
  const response =
    await httpClient.get<PaginatedProductsResponse>(
      "catalog/products/",
      {
        params: {
          company_id: companyId,
          search: search || undefined,
          page,
          page_size: pageSize,
          is_active: isActive,
          category: categoryId || undefined,
          brand: brandId || undefined,
          product_type: productType || undefined,
        },
      },
    );

  return response.data;
}

export async function createProduct(
  payload: CreateProductPayload,
): Promise<ProductDetail> {
  const response =
    await httpClient.post<ProductDetail>(
      "catalog/products/",
      payload,
    );

  return response.data;
}

export async function getProductDetail(
  productId: string,
): Promise<ProductDetail> {
  const response =
    await httpClient.get<ProductDetail>(
      `catalog/products/${productId}/`,
    );

  return response.data;
}

export async function updateProduct(
  productId: string,
  payload: UpdateProductPayload,
): Promise<ProductDetail> {
  const response =
    await httpClient.patch<ProductDetail>(
      `catalog/products/${productId}/`,
      payload,
    );

  return response.data;
}

export async function deleteProduct(
  productId: string,
): Promise<void> {
  await httpClient.delete(
    `catalog/products/${productId}/`,
  );
}