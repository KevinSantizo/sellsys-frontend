import { create } from "zustand";

import type { AuthUser } from "../types/auth";

const ACCESS_TOKEN_KEY = "sellsys-access-token";
const REFRESH_TOKEN_KEY = "sellsys-refresh-token";

function getStoredToken(key: string): string | null {
  return (
    localStorage.getItem(key) ??
    sessionStorage.getItem(key)
  );
}

function clearStoredTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);

  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  sessionStorage.removeItem(REFRESH_TOKEN_KEY);
}

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;

  setTokens: (
    accessToken: string,
    refreshToken: string,
    rememberMe: boolean,
  ) => void;

  setUser: (user: AuthUser) => void;
  logout: () => void;
};

const initialAccessToken = getStoredToken(
  ACCESS_TOKEN_KEY,
);

const initialRefreshToken = getStoredToken(
  REFRESH_TOKEN_KEY,
);

export const useAuthStore = create<AuthState>(
  (set) => ({
    accessToken: initialAccessToken,
    refreshToken: initialRefreshToken,
    user: null,
    isAuthenticated: Boolean(initialAccessToken),

    setTokens: (
      accessToken,
      refreshToken,
      rememberMe,
    ) => {
      clearStoredTokens();

      const storage = rememberMe
        ? localStorage
        : sessionStorage;

      storage.setItem(
        ACCESS_TOKEN_KEY,
        accessToken,
      );

      storage.setItem(
        REFRESH_TOKEN_KEY,
        refreshToken,
      );

      set({
        accessToken,
        refreshToken,
        isAuthenticated: true,
      });
 
    },

    setUser: (user) => {
      set({
        user,
      });
    },

    logout: () => {
      clearStoredTokens();

      set({
        accessToken: null,
        refreshToken: null,
        user: null,
        isAuthenticated: false,
      });
    },
  }),
);