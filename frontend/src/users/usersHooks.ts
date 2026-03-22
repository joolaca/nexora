// src/users/usersHooks.ts
import { useQuery } from "@tanstack/react-query";
import {
    listUsersApi,
    getUserPublicDataApi,
    type UsersListQuery,
} from "./usersApi";

export const usersKeys = {
    list: (q: UsersListQuery) => ["users", "list", q] as const,
    publicData: (userId: string) => ["users", "public-data", userId] as const,
};

export function useUsersList(q: UsersListQuery) {
    return useQuery({
        queryKey: usersKeys.list(q),
        queryFn: () => listUsersApi(q),
        retry: false,
    });
}

export function useUserPublicData(userId: string | null) {
    return useQuery({
        queryKey: usersKeys.publicData(userId ?? ""),
        queryFn: () => getUserPublicDataApi(userId!),
        enabled: !!userId,
        retry: false,
    });
}