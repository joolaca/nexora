import type { TFunction } from "i18next";
import { ApiError } from "../api/types";

function isApiError(err: unknown): err is ApiError {
    return typeof err === "object" && err !== null && (err as any).name === "ApiError";
}

export function translateApiError(
    err: unknown,
    t: TFunction,
    fallbackKey = "common.errorGeneric",
) {
    if (isApiError(err)) {
        const errorPayload = err.body?.error;

        const code = errorPayload?.code ?? errorPayload?.errorCode;
        const params = errorPayload?.params;

        if (code) {
            const translated = t(code, { ns: "error", ...(params ?? {}) });

            if (translated && translated !== code) {
                return translated;
            }
        }

        const rawMessage = errorPayload?.message;

        if (Array.isArray(rawMessage) && rawMessage.length > 0) {
            return rawMessage.join(", ");
        }

        if (typeof rawMessage === "string" && rawMessage.trim()) {
            return rawMessage;
        }

        if (err.message?.trim()) {
            return err.message;
        }
    }

    const fallback = t(fallbackKey);
    return fallback && fallback !== fallbackKey ? fallback : "Request failed";
}