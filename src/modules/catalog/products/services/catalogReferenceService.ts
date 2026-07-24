import { httpClient } from "../../../../api/httpClient";

import type {
  BrandOption,
  CategoryOption,
  UnitOption,
} from "../types/product";

type PaginatedResponse<T> = {
  results: T[];
};

function normalizeList<T>(
  data: T[] | PaginatedResponse<T>,
): T[] {
  return Array.isArray(data)
    ? data
    : data.results;
}

export async function getCategoryOptions(
  companyId: string,
): Promise<CategoryOption[]> {
  const response = await httpClient.get<
    CategoryOption[] | PaginatedResponse<CategoryOption>
  >("catalog/categories/", {
    params: {
      company_id: companyId,
    },
  });

  return normalizeList(response.data);
}

export async function getBrandOptions(
  companyId: string,
): Promise<BrandOption[]> {
  const response = await httpClient.get<
    BrandOption[] | PaginatedResponse<BrandOption>
  >("catalog/brands/", {
    params: {
      company_id: companyId,
    },
  });

  return normalizeList(response.data);
}

export async function getUnitOptions(
  companyId: string,
): Promise<UnitOption[]> {
  const response = await httpClient.get<
    UnitOption[] | PaginatedResponse<UnitOption>
  >("catalog/units/", {
    params: {
      company_id: companyId,
    },
  });

  return normalizeList(response.data);
}