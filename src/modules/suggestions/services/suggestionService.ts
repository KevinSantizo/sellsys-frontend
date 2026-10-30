import { httpClient } from "../../../api/httpClient";

import type {
  CreateSuggestionPayload,
  SuggestionResponse,
} from "../types/suggestion";


export async function createSuggestion(
  payload: CreateSuggestionPayload,
): Promise<SuggestionResponse> {
  const response =
    await httpClient.post<SuggestionResponse>(
      "suggestions/",
      payload,
    );

  return response.data;
}