import { httpClient } from "../../../../api/httpClient";

import type {
  CategoriesParams,
  CategoryDetail,
  CategoryListResponse,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from "../types/category";

export async function getCategories(params: CategoriesParams) {
  const response = await httpClient.get<CategoryListResponse>(
    "/catalog/categories/",
    {
      params: {
        company_id: params.companyId,
        search: params.search,
        parent: params.parentId,
        is_active: params.isActive,
        ordering: params.ordering,
        page: params.page ?? 1,
        page_size: params.pageSize ?? 10,
      },
    },
  );

  return response.data;
}

export async function getCategory(id: string) {
  const response = await httpClient.get<CategoryDetail>(
    `/catalog/categories/${id}/`,
  );

  return response.data;
}

export async function createCategory(payload: CreateCategoryPayload) {
  const response = await httpClient.post<CategoryDetail>(
    "/catalog/categories/",
    payload,
  );

  return response.data;
}

export async function updateCategory(id: string, payload: UpdateCategoryPayload) {
  const response = await httpClient.patch<CategoryDetail>(
    `/catalog/categories/${id}/`,
    payload,
  );

  return response.data;
}

export async function deleteCategory(id: string) {
  await httpClient.delete(
    `/catalog/categories/${id}/`,
  );
}