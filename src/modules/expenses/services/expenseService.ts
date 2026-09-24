import {httpClient} from "../../../api/httpClient";

import type {
  CreateExpensePayload,
  Expense,
  ExpenseCategoryListResponse,
  ExpenseListResponse,
  ExpensePaymentMethod,
  ExpenseStatus,
  UpdateExpensePayload,
} from "../types/expense";


type GetExpenseCategoriesParams = {
  companyId: string;
  search?: string;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
};


export async function getExpenseCategories({
  companyId,
  search,
  isActive,
  page = 1,
  pageSize = 100,
}: GetExpenseCategoriesParams) {
  const response =
    await httpClient.get<ExpenseCategoryListResponse>(
      "/expenses/categories/",
      {
        params: {
          company_id: companyId,
          search: search || undefined,
          is_active:
            isActive !== undefined
              ? isActive
              : undefined,
          page,
          page_size: pageSize,
        },
      },
    );

  return response.data;
}


type GetExpensesParams = {
  companyId: string;
  branchId: string;
  search?: string;
  categoryId?: string;
  supplierId?: string;
  status?: ExpenseStatus;
  paymentMethod?:
    ExpensePaymentMethod;
  ordering?: string;
  page?: number;
  pageSize?: number;
};


export async function getExpenses({
  companyId,
  branchId,
  search,
  categoryId,
  supplierId,
  status,
  paymentMethod,
  ordering,
  page = 1,
  pageSize = 10,
}: GetExpensesParams) {
  const response =
    await httpClient.get<ExpenseListResponse>(
      "/expenses/",
      {
        params: {
          company_id:
            companyId,

          branch_id:
            branchId,

          search:
            search ||
            undefined,

          category_id:
            categoryId ||
            undefined,

          supplier_id:
            supplierId ||
            undefined,

          status:
            status ||
            undefined,

          payment_method:
            paymentMethod ||
            undefined,

          ordering:
            ordering ||
            undefined,

          page,

          page_size:
            pageSize,
        },
      },
    );

  return response.data;
}


export async function getExpense(
  expenseId: string,
) {
  const response =
    await httpClient.get<Expense>(
      `/expenses/${expenseId}/`,
    );

  return response.data;
}


export async function createExpense(
  payload: CreateExpensePayload,
) {
  const response =
    await httpClient.post<Expense>(
      "/expenses/",
      payload,
    );

  return response.data;
}


export async function updateExpense(
  expenseId: string,
  payload: UpdateExpensePayload,
) {
  const response =
    await httpClient.patch<Expense>(
      `/expenses/${expenseId}/`,
      payload,
    );

  return response.data;
}


export async function completeExpense(
  expenseId: string,
  cashSessionId?: string,
) {
  const response =
    await httpClient.post<Expense>(
      `/expenses/${expenseId}/complete/`,
      cashSessionId
        ? {
            cash_session_id: cashSessionId,
          }
        : {},
    );

  return response.data;
}


export async function cancelExpense(
  expenseId: string,
) {
  const response =
    await httpClient.post<Expense>(
      `/expenses/${expenseId}/cancel/`,
    );

  return response.data;
}