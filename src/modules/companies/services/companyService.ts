import {
  httpClient,
} from "../../../api/httpClient";

import type {
  Company,
} from "../types/company";

export async function getCompanies():
Promise<Company[]> {
  const response =
    await httpClient.get<Company[]>(
      "companies/",
    );

  return response.data;
}