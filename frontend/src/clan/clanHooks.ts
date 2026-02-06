// src/clan/clanHooks.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClanApi, editClanApi, myClanApi } from "./clanApi";

export const clanKeys = {
    me: ["clan", "me"] as const,
};

export function useMyClan() {
    return useQuery({
        queryKey: clanKeys.me,
        queryFn: myClanApi,
        retry: false,
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
