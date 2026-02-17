// src/auth/authHooks.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { loginApi, meApi, updateMeApi } from "./authApi";
import { setToken, getToken, clearToken } from "./tokenStorage";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ApiError } from "../api/types";

export const authKeys = {
    me: ["auth", "me"] as const,
};

const ME_MAX_RETRIES = 5;

export function useMe() {
    const token = getToken();

    return useQuery({
        queryKey: authKeys.me,
        queryFn: meApi,
        enabled: !!token,

        retry: (failureCount, error) => {
            const err = error as ApiError;

            if (err?.statusCode === 401 || err?.statusCode === 409) return false;

            if (err?.statusCode >= 500 && err?.statusCode < 600) {
                return failureCount < ME_MAX_RETRIES;
            }

            return false;
        },

        retryDelay: (attemptIndex) => {
            const delay = 500 * Math.pow(2, attemptIndex); // 500,1000,2000,4000...
            return Math.min(delay, 8000);
        },
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
