import { httpClient } from "../../../api/httpClient";

import type {
  SessionContext,
} from "../../branches/types/branch";

export async function getSessionContext(
  companyId: string,
): Promise<SessionContext> {
  const response =
    await httpClient.get<SessionContext>(
      "auth/context/",
      {
        params: {
          company_id: companyId,
        },
      },
    );

  return response.data;
}