// src/api/errorUtils.ts
import type { TFunction } from "i18next";
import { ApiError } from "./types";
import { translateApiError } from "../i18n/translateApiError";

export function isApiError(error: unknown): error is ApiError {
    return error instanceof ApiError || (
        typeof error === "object" &&
        error !== null &&
        "name" in error &&
        (error as any).name === "ApiError"
    );
}

export function isUnauthorizedError(error: unknown): boolean {
    return isApiError(error) && error.statusCode === 401;
}

export function getApiErrorMessage(
    error: unknown,
    t: TFunction,
    fallbackKey = "common.errorGeneric",
): string {
    return translateApiError(error, t, fallbackKey);
}