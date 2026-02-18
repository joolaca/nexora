// src/clans/requests/api/invites.api.ts
import { apiFetch } from "../../../api/http";
import type { ClanInviteRequest, ClanInviteResponse } from "./requests.types";

export function inviteToClanApi(params: { clanId: string; body: ClanInviteRequest }) {
    const { body } = params;
    return apiFetch<ClanInviteResponse>(`/clans/invite`, { method: "POST", body });
}
