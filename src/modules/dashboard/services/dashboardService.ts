import {httpClient} from "../../../api/httpClient";

import type {
  WeeklySalesSummary,YearlySalesSummary
} from "../types/dashboard.types";

type GetWeeklySalesParams = {
  companyId: string;
  branchId: string;
};

type GetYearlySalesParams = {
  companyId: string;
  branchId: string;
};

export async function getWeeklySales({
  companyId,
  branchId,
}: GetWeeklySalesParams) {
  const response =
    await httpClient.get<WeeklySalesSummary>(
      "/sales/weekly-summary/",
      {
        params: {
          company_id: companyId,
          branch_id: branchId,
        },
      },
    );

  return response.data;
}

export async function getYearlySales({
  companyId,
  branchId,
}: GetYearlySalesParams) {
  const response =
    await httpClient.get<YearlySalesSummary>(
      "/sales/yearly-summary/",
      {
        params: {
          company_id: companyId,
          branch_id: branchId,
        },
      },
    );

  return response.data;
}