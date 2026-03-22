// src/admin/adminApi.ts
import { apiFetch } from "../api/http";

export type InternalErrorTestResponse = {
    data: null;
    error: {
        statusCode: number;
        errorCode: string;
        params: Record<string, unknown>;
        requestBody: unknown;
        context: Record<string, unknown>;
        message: string;
        severity: string;
        kind: string;
        domain: string | null;
        path: string;
        method: string;
        name: string;
        stack?: string;
    };
    meta: {
        timestamp: string;
    };
};

export function getInternalAppError() {
    return apiFetch<InternalErrorTestResponse>("/internal/errors/test?type=app", {
        method: "GET",
    });
}