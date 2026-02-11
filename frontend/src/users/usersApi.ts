// src/users/usersApi.ts
import { apiFetch } from "../api/http";

export type ClanSummary = {
    id: string;
    name: string;
    slug: string;
};

export type UserListItem = {
    id: string;
    username: string;
    rank: number;
    clan: ClanSummary | null;
};

export type SortKey = "rank_desc" | "rank_asc" | "username_asc" | "username_desc";

export type UsersListQuery = {
    limit?: number;
    page?: number;
    sort?: "rank_desc" | "rank_asc" | "username_asc" | "username_desc";
    minRank?: number;
    maxRank?: number;
    clan?: "any" | "in" | "none";
};


export type UsersListMeta = {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
    sort: SortKey | string;
};

export type UsersListResponse = {
    items: UserListItem[];
    meta: UsersListMeta;
};

export function listUsersApi(q: UsersListQuery) {
    const params = new URLSearchParams();
    if (q.limit) params.set("limit", String(q.limit));
    if (q.page) params.set("page", String(q.page));
    if (q.sort) params.set("sort", q.sort);
    if (q.minRank !== undefined) params.set("minRank", String(q.minRank));
    if (q.maxRank !== undefined) params.set("maxRank", String(q.maxRank));
    if (q.clan && q.clan !== "any") params.set("clan", q.clan);

    const suffix = params.toString() ? `?${params.toString()}` : "";
    return apiFetch<UsersListResponse>(`/users${suffix}`, { method: "GET" });
}
