import { httpClient } from "../../../api/httpClient";

import type {
  AuthUser,
  LoginCredentials,
  TokenResponse,
} from "../types/auth";

export async function login(
  credentials: LoginCredentials,
): Promise<TokenResponse> {
  const response =
    await httpClient.post<TokenResponse>(
      "auth/token/",
      credentials,
    );

  return response.data;
}

export async function getCurrentUser():
Promise<AuthUser> {
  const response =
    await httpClient.get<AuthUser>(
      "auth/me/",
    );

  return response.data;
}