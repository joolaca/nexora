// src/clans/overview/api/overview.api.ts
import { apiFetch } from "../../../api/http";
import type { ClanCreateRequest, ClanCreateResponse, ClanEditRequest, ClanEditResponse, ClanMeResponse } from "./overview.types";

export function createClanApi(body: ClanCreateRequest) {
    return apiFetch<ClanCreateResponse>("/clans", { method: "POST", body });
}

export function editClanApi(body: ClanEditRequest) {
    return apiFetch<ClanEditResponse>("/clans", { method: "PATCH", body });
}

export function myClanApi() {
    return apiFetch<ClanMeResponse | null>("/clans/me", { method: "GET" });
}
