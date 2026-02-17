// src/clans/overview/hooks/overview.hooks.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClanApi, editClanApi, myClanApi } from "../api/overview.api";

export const clanKeys = {
    me: ["clan", "me"] as const,
};

export function useMyClan() {
    return useQuery({
        queryKey: clanKeys.me,
        queryFn: myClanApi,
        retry: false,

        staleTime: 60_000,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    });
}

export function useCreateClan() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: createClanApi,
        onSuccess: async () => {
            await qc.invalidateQueries({ queryKey: clanKeys.me });
        },
    });
}

export function useEditClan() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: editClanApi,
        onSuccess: async () => {
            await qc.invalidateQueries({ queryKey: clanKeys.me });
        },
    });
}
