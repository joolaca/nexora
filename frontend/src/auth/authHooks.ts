// src/auth/authHooks.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { loginApi, meApi, updateMeApi } from "./authApi";
import { setToken, getToken, clearToken } from "./tokenStorage";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

export const authKeys = {
    me: ["auth", "me"] as const,
};

export function useMe() {
    const token = getToken();
    return useQuery({
        queryKey: authKeys.me,
        queryFn: meApi,
        enabled: !!token,
        retry: false,
    });
}

export function useLogin() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: ({ username, password }: { username: string; password: string }) => loginApi(username, password),
        onSuccess: async (data) => {
            setToken(data.token);
            await qc.invalidateQueries({ queryKey: authKeys.me });
        },
    });
}

export function useUpdateMe() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: updateMeApi,
        onSuccess: async () => {
            await qc.invalidateQueries({ queryKey: authKeys.me });
        },
    });
}

export function useLogout() {
    const qc = useQueryClient();
    const navigate = useNavigate();

    return useCallback(() => {
        clearToken();
        qc.removeQueries({ queryKey: ["auth", "me"] });
        navigate("/login", { replace: true });
    }, [qc, navigate]);
}
