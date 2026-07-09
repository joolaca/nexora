// src/clans/my-requests/api/my-clan-requests.api.ts

import { apiFetch } from "../../../api/http";
import type { MyClanInviteListItem } from "./my-clan-requests.types";

export function myClanInvitesApi() {
    return apiFetch<MyClanInviteListItem[]>("/clans/requests/my-invites", {
        method: "GET",
    });
}

export function acceptMyClanInviteApi(params: { requestId: string }) {
    return apiFetch<{ ok: true }>(`/clans/requests/${params.requestId}/accept`, {
        method: "POST",
    });
}

export function rejectMyClanInviteApi(params: { requestId: string }) {
    return apiFetch<{ ok: true }>(`/clans/requests/${params.requestId}/reject`, {
        method: "POST",
    });
}