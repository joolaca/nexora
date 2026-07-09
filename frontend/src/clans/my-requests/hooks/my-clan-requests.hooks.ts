// src/clans/my-requests/hooks/my-clan-requests.hooks.ts

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    acceptMyClanInviteApi,
    myClanInvitesApi,
    rejectMyClanInviteApi,
} from "../api/my-clan-requests.api";
import { clanKeys } from "../../overview/hooks/overview.hooks";

export const myClanRequestKeys = {
    invites: ["clan", "my-requests", "invites"] as const,
};

export function useMyClanInvites() {
    return useQuery({
        queryKey: myClanRequestKeys.invites,
        queryFn: myClanInvitesApi,
        retry: false,
        staleTime: 10_000,
        refetchOnWindowFocus: false,
    });
}

export function useAcceptMyClanInvite() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: acceptMyClanInviteApi,
        onSuccess: async () => {
            await qc.invalidateQueries({ queryKey: myClanRequestKeys.invites });
            await qc.invalidateQueries({ queryKey: clanKeys.me });
        },
    });
}

export function useRejectMyClanInvite() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: rejectMyClanInviteApi,
        onSuccess: async () => {
            await qc.invalidateQueries({ queryKey: myClanRequestKeys.invites });
        },
    });
}