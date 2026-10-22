import axios from "axios";

function flattenErrorMessages(value: unknown): string[] {
    if (typeof value === "string") {
        return [value];
    }

    if (Array.isArray(value)) {
        return value.flatMap(flattenErrorMessages);
    }

    if (value !== null && typeof value === "object") {
        return Object.values(value).flatMap(flattenErrorMessages);
    }

    return [];
}

export function getApiErrorMessage(
    error: unknown,
    fallback = "Ocurrió un error inesperado.",
): string {
    if (!axios.isAxiosError(error)) {
        if (error instanceof Error && error.message) {
            return error.message;
        }

        return fallback;
    }

    if (!error.response) {
        return error.message || "No fue posible conectarse con el servidor.";
    }

    const messages = flattenErrorMessages(error.response.data);

    if (messages.length === 0) {
        return fallback;
    }

    return messages.join(" ");
}