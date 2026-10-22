import { httpClient } from "../../../../api/httpClient";

import type {
  CreateUnitOfMeasurePayload,
  UnitOfMeasureDetail,
  UnitOfMeasureListResponse,
  UnitsOfMeasureParams,
  UpdateUnitOfMeasurePayload,
} from "../../units/types/units";

export async function getUnitsOfMeasure(params: UnitsOfMeasureParams) {
  const response = await httpClient.get<UnitOfMeasureListResponse>(
    "/catalog/units/",
    {
      params: {
        company_id: params.companyId,
        search: params.search,
        unit_type: params.unitType,
        allows_decimal: params.allowsDecimal,
        is_active: params.isActive,
        ordering: params.ordering,
        page: params.page ?? 1,
        page_size: params.pageSize ?? 10,
      },
    },
  );

  return response.data;
}

export async function getUnitOfMeasure(id: string) {
  const response = await httpClient.get<UnitOfMeasureDetail>(
    `/catalog/units/${id}/`,
  );

  return response.data;
}

export async function createUnitOfMeasure(payload: CreateUnitOfMeasurePayload) {
  const response = await httpClient.post<UnitOfMeasureDetail>(
    "/catalog/units/",
    payload,
  );

  return response.data;
}

export async function updateUnitOfMeasure(
  id: string,
  payload: UpdateUnitOfMeasurePayload,
) {
  const response = await httpClient.patch<UnitOfMeasureDetail>(
    `/catalog/units/${id}/`,
    payload,
  );

  return response.data;
}

export async function deleteUnitOfMeasure(id: string) {
  await httpClient.delete(
    `/catalog/units/${id}/`,
  );
}