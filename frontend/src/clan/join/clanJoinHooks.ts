// src/clan/join/clanJoinHooks.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { inviteToClanApi } from "./clanJoinApi";

export const clanJoinKeys = {
    myRequests: ["clan", "join", "me"] as const,
    clanPending: (clanId: string) => ["clan", "join", "pending", clanId] as const,
};

export function useInviteToClan() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: inviteToClanApi,
        onSuccess: async (data, vars) => {
            // ezek majd akkor hasznosak, ha később listázod a requesteket
            await qc.invalidateQueries({ queryKey: clanJoinKeys.myRequests });
            await qc.invalidateQueries({ queryKey: clanJoinKeys.clanPending(vars.clanId) });
        },
    });
}
