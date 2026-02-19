// src/clans/requests/api/requests.api.ts
import { apiFetch } from "../../../api/http";
import type { ClanRequestListItem } from "./requests.types";
import type { ClanInviteListItem } from "./requests.types";

export function myClanRequestsApi() {
    return apiFetch<ClanRequestListItem[]>("/clans/requests/me", { method: "GET" });
}

export function acceptClanRequestApi(params: { requestId: string }) {
    return apiFetch<{ ok: true }>(`/clans/requests/${params.requestId}/accept`, { method: "POST" });
}

export function rejectClanRequestApi(params: { requestId: string }) {
    return apiFetch<{ ok: true }>(`/clans/requests/${params.requestId}/reject`, { method: "POST" });
}

export function cancelClanRequestApi(params: { requestId: string }) {
    return apiFetch<{ ok: true }>(`/clans/requests/${params.requestId}/cancel`, { method: "POST" });
}

export function clanInviteListApi() {
    return apiFetch<ClanInviteListItem[]>("/clans/requests/invites/pending", { method: "GET" });
}