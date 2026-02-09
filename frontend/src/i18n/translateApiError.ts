// src/i18n/translateApiError.ts
import type { TFunction } from "i18next";
import { ApiError } from "../api/types";

function isApiError(err: unknown): err is ApiError {
    return typeof err === "object" && err !== null && (err as any).name === "ApiError";
}

/**
 * Convention:
 * - backend: error.code pl. "AUTH_INVALID_CREDENTIALS"
 * - frontend i18n key: error: { "AUTH_INVALID_CREDENTIALS": "..." }
 */
export function translateApiError(err: unknown, t: TFunction, fallbackKey = "common.errorGeneric") {
    if (isApiError(err)) {
        const code = err.body?.error?.code;
        const params = err.body?.error?.params;

        if (code) {
            const key = code;
            const translated = t(key, { ns: "error", ...(params ?? {}) });

            if (translated && translated !== key) return translated;
        }

        if (err.message) return err.message;
    }

    const fb = t(fallbackKey);
    return fb && fb !== fallbackKey ? fb : "Request failed";
}
