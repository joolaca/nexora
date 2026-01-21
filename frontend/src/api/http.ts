import { ApiError, ApiFailure, ApiSuccess } from "./types";
import { getToken, clearToken } from "../auth/tokenStorage";

// Docker/Vite proxy miatt alapból relatív URL-eket használunk (/auth/...)
// Ha később prod buildnél kell base URL, ide jöhet VITE_API_BASE_URL.
const API_BASE = "";

type FetchOptions = Omit<RequestInit, "body"> & { body?: unknown };

export async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
    const headers = new Headers(options.headers);

    // csak akkor állítsuk, ha body is van
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

    // SIKER: { data, meta }
    if (res.ok) {
        const ok = payload as ApiSuccess<T>;
        return ok.data;
    }

    // HIBA: { data:null, error, meta }
    const fail = payload as ApiFailure;
    const msg =
        (fail?.error?.message && Array.isArray(fail.error.message) ? fail.error.message.join(", ") : fail?.error?.message) ||
        "Request failed";

    // 401 esetén töröljük a tokent -> a UI majd reagál (RequireAuth / useMe)
    if (res.status === 401) {
        clearToken();
    }

    throw new ApiError(String(msg), res.status, fail);
}
