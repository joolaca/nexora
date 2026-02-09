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

export type UsersListQuery = {
    limit?: number;
    sort?: "rank_desc" | "rank_asc" | "username_asc" | "username_desc";
};

export function listUsersApi(q: UsersListQuery) {
    const params = new URLSearchParams();
    if (q.limit) params.set("limit", String(q.limit));
    if (q.sort) params.set("sort", q.sort);

    const suffix = params.toString() ? `?${params.toString()}` : "";
    return apiFetch<UserListItem[]>(`/users${suffix}`, { method: "GET" });
}
