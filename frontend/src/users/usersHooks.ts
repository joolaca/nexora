// src/users/usersHooks.ts
import { useQuery } from "@tanstack/react-query";
import { listUsersApi, type UsersListQuery } from "./usersApi";

export const usersKeys = {
    list: (q: UsersListQuery) => ["users", "list", q] as const,
};

export function useUsersList(q: UsersListQuery) {
    return useQuery({
        queryKey: usersKeys.list(q),
        queryFn: () => listUsersApi(q),
        retry: false,
    });
}
