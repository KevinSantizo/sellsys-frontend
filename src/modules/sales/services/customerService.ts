import { httpClient } from "../../../api/httpClient";

import type {
  CreateCustomerPayload,
  Customer,
  CustomersResponse,
} from "../types/customer.types";

export type GetCustomersParams = {
  companyId: string;
  search?: string;
  ordering?: string;
  page?: number;
  pageSize?: number;
};

export async function getCustomers(
  params: GetCustomersParams,
): Promise<CustomersResponse> {
  const response =
    await httpClient.get<CustomersResponse>(
      "/sales/customers/",
      {
        params: {
          company_id: params.companyId,
          search: params.search,
          ordering: params.ordering,
          page: params.page,
          page_size: params.pageSize,
        },
      },
    );

  return response.data;
}

export async function createCustomer(
  payload: CreateCustomerPayload,
): Promise<Customer> {
  const response =
    await httpClient.post<Customer>(
      "/sales/customers/",
      payload,
    );

  return response.data;
}