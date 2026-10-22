import axios from "axios";

import type {
    InternalAxiosRequestConfig,
} from "axios";

import { useAuthStore } from "../modules/auth/store/authStore";

const apiUrl = import.meta.env.VITE_API_URL;

if (!apiUrl) {
    throw new Error(
        "La variable VITE_API_URL no está configurada.",
    );
}

type RetryableRequestConfig = InternalAxiosRequestConfig & {
    _retry?: boolean;
};

type RefreshTokenResponse = {
    access: string;
    refresh?: string;
};

export const httpClient = axios.create({
    baseURL: apiUrl,
    timeout: 15000,
    headers: {
        "Content-Type": "application/json",
    },
});

const refreshClient = axios.create({
    baseURL: apiUrl,
    timeout: 15000,
    headers: {
        "Content-Type": "application/json",
    },
});

let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(refreshToken: string): Promise<string> {
    const response = await refreshClient.post<RefreshTokenResponse>(
        "auth/token/refresh/",
        {
            refresh: refreshToken,
        },
    );

    const newAccessToken = response.data.access;
    const newRefreshToken = response.data.refresh;

    useAuthStore.getState().updateTokens(
        newAccessToken,
        newRefreshToken,
    );

    return newAccessToken;
}

httpClient.interceptors.request.use(
    (config) => {
        const accessToken = useAuthStore.getState().accessToken;

        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }

        return config;
    },
    (error: unknown) => {
        return Promise.reject(error);
    },
);

httpClient.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error: unknown) => {
        if (!axios.isAxiosError(error)) {
            return Promise.reject(error);
        }

        if (!error.response) {
            if (error.code === "ECONNABORTED") {
                error.message = "El servidor tardó demasiado en responder.";
            } else {
                error.message = "No fue posible conectarse con el servidor.";
            }

            return Promise.reject(error);
        }

        if (error.response.status !== 401 || !error.config) {
            return Promise.reject(error);
        }

        const originalRequest = error.config as RetryableRequestConfig;
        const currentAccessToken = useAuthStore.getState().accessToken;
        const requestAuthorization = originalRequest.headers.Authorization;

        if (
          currentAccessToken &&
          requestAuthorization !== `Bearer ${currentAccessToken}`
        ) {
          originalRequest.headers.Authorization = `Bearer ${currentAccessToken}`; 
          return httpClient(originalRequest);
        }

        if (
          originalRequest._retry ||
          originalRequest.url?.includes("auth/token/")
        ) {
          return Promise.reject(error);
        }

        const authState = useAuthStore.getState();
        const refreshToken = authState.refreshToken;

        if (!refreshToken) {
            authState.logout();

            return Promise.reject(error);
        }

        originalRequest._retry = true;

        try {
            if (!refreshPromise) {
                refreshPromise = refreshAccessToken(refreshToken);
            }

            const newAccessToken = await refreshPromise;

            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

            return httpClient(originalRequest);
        } catch {
            useAuthStore.getState().logout();

            return Promise.reject(error);
        } finally {
            refreshPromise = null;
        }
    },
);