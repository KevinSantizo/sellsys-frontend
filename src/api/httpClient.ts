import axios from "axios";

import { useAuthStore } from "../modules/auth/store/authStore";

const apiUrl = import.meta.env.VITE_API_URL;

if (!apiUrl) {
  throw new Error(
    "La variable VITE_API_URL no está configurada.",
  );
}

export const httpClient = axios.create({
  baseURL: apiUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

httpClient.interceptors.request.use(
  (config) => {
    const accessToken =
      useAuthStore.getState().accessToken;

    if (accessToken) {
      config.headers.Authorization =
        `Bearer ${accessToken}`;
    }

    return config;
  },
  (error: unknown) => {
    return Promise.reject(error);
  },
);