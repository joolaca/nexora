// src/clan/requests/api/invites.api.ts
import { apiFetch } from "../../../api/http";
import type { ClanInviteRequest, ClanInviteResponse } from "./requests.types";

export function inviteToClanApi(params: { clanId: string; body: ClanInviteRequest }) {
    const { clanId, body } = params;
    return apiFetch<ClanInviteResponse>(`/clans/${clanId}/invite`, { method: "POST", body });
}
