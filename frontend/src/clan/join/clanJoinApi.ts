// src/clan/join/clanJoinApi.ts
import { apiFetch } from "../../api/http";

export type ClanInviteRequest = {
    userId: string;
};

export type ClanInviteResponse = {
    requestId: string;
    status: "PENDING" | "ACCEPTED";
    autoAccepted: boolean;
};

export function inviteToClanApi(params: { clanId: string; body: ClanInviteRequest }) {
    const { clanId, body } = params;
    return apiFetch<ClanInviteResponse>(`/clans/${clanId}/invite`, { method: "POST", body });
}
