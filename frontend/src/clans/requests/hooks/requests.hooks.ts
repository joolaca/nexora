// src/clans/requests/hooks/requests.hooks.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { acceptClanRequestApi, cancelClanRequestApi, myClanRequestsApi, rejectClanRequestApi } from "../api/requests.api";
import { inviteToClanApi } from "../api/invites.api";
import { clanKeys } from "../../overview/hooks/overview.hooks";
import { clanInviteListApi } from "../api/requests.api";

export const clanRequestKeys = {
    me: ["clan", "requests", "me"] as const,
    clanPending: (clanId: string) => ["clan", "requests", "pending", clanId] as const,
    invites: ["clan", "invites", "pending"] as const,
};

export function useMyClanRequests() {
    return useQuery({
        queryKey: clanRequestKeys.me,
        queryFn: myClanRequestsApi,
        retry: false,
        staleTime: 10_000,
        refetchOnWindowFocus: false,
    });
}

export function useAcceptClanRequest() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: acceptClanRequestApi,
        onSuccess: async () => {
            // meghívók frissítése + ha beléptél egy klánba, a /clans/me is frissüljön
            await qc.invalidateQueries({ queryKey: clanRequestKeys.me });
            await qc.invalidateQueries({ queryKey: clanKeys.me });
        },
    });
}

export function useRejectClanRequest() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: rejectClanRequestApi,
        onSuccess: async () => {
            await qc.invalidateQueries({ queryKey: clanRequestKeys.me });
        },
    });
}

export function useCancelClanRequest() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: cancelClanRequestApi,
        onSuccess: async () => {
            await qc.invalidateQueries({ queryKey: clanRequestKeys.me });
        },
    });
}

export function useInviteToClan() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: inviteToClanApi,
        onSuccess: async (_data, vars) => {
            // később: ha lesz pending clans lista, ez jól jön
            await qc.invalidateQueries({ queryKey: clanRequestKeys.me });
            await qc.invalidateQueries({ queryKey: clanRequestKeys.clanPending(vars.clanId) });
        },
    });
}

export function useClanInviteList() {
    return useQuery({
        queryKey: clanRequestKeys.invites,
        queryFn: clanInviteListApi,
        retry: false,
        staleTime: 10_000,
        refetchOnWindowFocus: false,
    });
}


export function useRevokeClanInvite() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: cancelClanRequestApi,
        onSuccess: async () => {
            await qc.invalidateQueries({ queryKey: clanRequestKeys.invites });
            await qc.invalidateQueries({ queryKey: clanRequestKeys.me });
        },
    });
}