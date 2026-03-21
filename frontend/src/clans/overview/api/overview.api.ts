import { apiFetch } from "../../../api/http";
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

export function myClanApi() {
    return apiFetch<ClanMeResponse | null>("/clans/me", { method: "GET" });
}