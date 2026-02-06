// src/clan/clanApi.ts
import { apiFetch } from "../api/http";

export type ClanCreateRequest = {
    name: string;
    slug?: string;
};

export type ClanCreateResponse = {
    id: string;
    name: string;
    slug: string;
    myRole: string;
};

export type ClanEditRequest = {
    name?: string;
    slug?: string;
};

export type ClanEditResponse = {
    id: string;
    name: string;
    slug: string;
};

export type ClanMeResponse = {
    id: string;
    name: string;
    slug: string;
    myRole: string;
    permissions?: string[];
};

export function createClanApi(body: ClanCreateRequest) {
    return apiFetch<ClanCreateResponse>("/clans", { method: "POST", body });
}

export function editClanApi(body: ClanEditRequest) {
    return apiFetch<ClanEditResponse>("/clans", { method: "PATCH", body });
}

export function myClanApi() {
    return apiFetch<ClanMeResponse | null>("/clans/me", { method: "GET" });
}
