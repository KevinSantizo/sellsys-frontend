import {httpClient} from "../../../api/httpClient";

import type {
  CashMovement,
  CashMovementListResponse,
  CashMovementsParams,
  CashRegister,
  CashRegisterListResponse,
  CashRegistersParams,
  CashSession,
  CashSessionListResponse,
  CashSessionsParams,
  CashSessionSummary,
  CloseCashSessionPayload,
  CreateCashRegisterPayload,
  ManualCashMovementPayload,
  OpenCashSessionPayload,
  UpdateCashRegisterPayload,
} from "../types/cash";


export async function getCashRegisters(params: CashRegistersParams) {
  const response = await httpClient.get<CashRegisterListResponse>("/cash/registers/", {
    params: {
      company_id: params.companyId,
      branch_id: params.branchId,
      is_active: params.isActive,
      search: params.search,
      ordering: params.ordering,
      page: params.page ?? 1,
      page_size: params.pageSize ?? 10,
    },
  });

  return response.data;
}


export async function getCashRegister(id: string) {
  const response = await httpClient.get<CashRegister>(`/cash/registers/${id}/`);

  return response.data;
}


export async function createCashRegister(payload: CreateCashRegisterPayload) {
  const response = await httpClient.post<CashRegister>("/cash/registers/", payload);

  return response.data;
}


export async function updateCashRegister(id: string, payload: UpdateCashRegisterPayload) {
  const response = await httpClient.patch<CashRegister>(`/cash/registers/${id}/`, payload);

  return response.data;
}


export async function getCashSessions(params: CashSessionsParams) {
  const response = await httpClient.get<CashSessionListResponse>("/cash/sessions/", {
    params: {
      company_id: params.companyId,
      branch_id: params.branchId,
      cash_register_id: params.cashRegisterId,
      status: params.status,
      ordering: params.ordering ?? "-opened_at",
      page: params.page ?? 1,
      page_size: params.pageSize ?? 10,
    },
  });

  return response.data;
}


export async function getCashSession(id: string) {
  const response = await httpClient.get<CashSession>(`/cash/sessions/${id}/`);

  return response.data;
}


export async function openCashSession(payload: OpenCashSessionPayload) {
  const response = await httpClient.post<CashSession>("/cash/sessions/open/", payload);

  return response.data;
}


export async function closeCashSession(id: string, payload: CloseCashSessionPayload) {
  const response = await httpClient.post<CashSession>(`/cash/sessions/${id}/close/`, payload);

  return response.data;
}


export async function getCashMovements(params: CashMovementsParams) {
  const response = await httpClient.get<CashMovementListResponse>("/cash/movements/", {
    params: {
      company_id: params.companyId,
      branch_id: params.branchId,
      cash_session_id: params.cashSessionId,
      cash_register_id: params.cashRegisterId,
      direction: params.direction,
      movement_type: params.movementType,
      source_type: params.sourceType,
      search: params.search,
      ordering: params.ordering,
      page: params.page ?? 1,
      page_size: params.pageSize ?? 10,
    },
  });

  return response.data;
}

export async function getCashMovement(id: string) {
  const response = await httpClient.get<CashMovement>(`/cash/movements/${id}/`);

  return response.data;
}

export async function createManualCashMovement(payload: ManualCashMovementPayload) {
  const response = await httpClient.post<CashMovement>("/cash/movements/manual/", payload);

  return response.data;
}

export async function getCashSessionSummary(id: string) {
  const response = await httpClient.get<CashSessionSummary>(`/cash/sessions/${id}/summary/`)
  return response.data;
}