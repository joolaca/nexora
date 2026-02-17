import { ApiError, ApiFailure, ApiSuccess } from "./types";
import { getToken, clearToken } from "../auth/tokenStorage";

const API_BASE = "";
type FetchOptions = Omit<RequestInit, "body"> & { body?: unknown };

export async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
    const headers = new Headers(options.headers);

    if (options.body !== undefined && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
    }

    const token = getToken();
    if (token && !headers.has("Authorization")) {
        headers.set("Authorization", `Bearer ${token}`);
    }

    const res = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers,
        body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });

    const contentType = res.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");

    const payload = isJson ? await res.json() : await res.text();

    if (res.ok) {
        const ok = payload as ApiSuccess<T>;
        return ok.data;
    }

    if (isJson) {
        const fail = payload as ApiFailure;

        const msg =
            (fail?.error?.message && Array.isArray(fail.error.message)
                ? fail.error.message.join(", ")
                : fail?.error?.message) || "Request failed";

        const isInvalidToken =
            res.status === 401 ||
            (res.status === 409 && fail?.error?.code === "INVALID_TOKEN");

        if (isInvalidToken) clearToken();

        throw new ApiError(String(msg), res.status, fail);
    }

    const rawText = typeof payload === "string" ? payload : String(payload);

    if (res.status === 401) clearToken();

    throw new ApiError(rawText || "Request failed", res.status, {
        data: null,
        error: {
            statusCode: res.status,
            message: rawText || "Request failed",
            code: "NON_JSON_ERROR",
        },
        meta: {},
    });
}
