import { apiFetch } from "../../../api/http";
import { ApiError } from "../../../api/types";

import type {
    ClanCreateRequest,
    ClanCreateResponse,
    ClanEditRequest,
    ClanEditResponse,
    ClanMeResponse,
} from "./overview.types";

export function createClanApi(params: {
    body: ClanCreateRequest;
    idempotencyKey: string;
}) {
    const { body, idempotencyKey } = params;

    return apiFetch<ClanCreateResponse>("/clans", {
        method: "POST",
        body,
        headers: {
            "Idempotency-Key": idempotencyKey,
        },
    });
}

export function editClanApi(body: ClanEditRequest) {
    return apiFetch<ClanEditResponse>("/clans", { method: "PATCH", body });
}

export async function myClanApi() {
    try {
        return await apiFetch<ClanMeResponse>("/clans/me", { method: "GET" });
    } catch (error) {
        if (error instanceof ApiError && error.statusCode === 404) {
            return null;
        }

        throw error;
    }
}