import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    loginApi,
    meApi,
    registerApi,
    updateMeApi,
    type AuthUser,
    type UserRole,
} from "./authApi";
import { setToken, getToken, clearToken } from "./tokenStorage";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ApiError } from "../api/types";

export const authKeys = {
    me: ["auth", "me"] as const,
};

const ME_MAX_RETRIES = 2;

export function useMe() {
    const token = getToken();

    return useQuery({
        queryKey: authKeys.me,
        queryFn: meApi,
        enabled: !!token,
        staleTime: 30_000,

        retry: (failureCount, error) => {
            const err = error as ApiError;

            if (err?.statusCode === 401 || err?.statusCode === 409) return false;

            if (err?.statusCode >= 500 && err?.statusCode < 600) {
                return failureCount < ME_MAX_RETRIES;
            }

            return false;
        },

        retryDelay: (attemptIndex) => {
            const delay = 500 * Math.pow(2, attemptIndex);
            return Math.min(delay, 8000);
        },
    });
}

export function useLogin() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: ({ username, password }: { username: string; password: string }) =>
            loginApi(username, password),
        onSuccess: async (data) => {
            setToken(data.token);
            await qc.invalidateQueries({ queryKey: authKeys.me });
        },
    });
}

export function useRegister() {
    return useMutation({
        mutationFn: ({ username, password }: { username: string; password: string }) =>
            registerApi(username, password),
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
        qc.removeQueries({ queryKey: authKeys.me });
        navigate("/login", { replace: true });
    }, [qc, navigate]);
}

type UseAuthResult = {
    user: AuthUser | null;
    role: UserRole | null;
    isAuthenticated: boolean;
    isAdmin: boolean;
    isLoading: boolean;
    isReady: boolean;
    logout: () => void;
    hasRole: (role: UserRole) => boolean;
};

export function useAuth(): UseAuthResult {
    const token = getToken();
    const me = useMe();
    const logout = useLogout();

    const user = (me.data ?? null) as AuthUser | null;
    const role = user?.role ?? null;

    const isLoading = !!token && me.isLoading;
    const isAuthenticated = !!token && !!user;
    const isAdmin = role === "admin";

    const hasRole = (expectedRole: UserRole) => role === expectedRole;

    return {
        user,
        role,
        isAuthenticated,
        isAdmin,
        isLoading,
        isReady: !isLoading,
        logout,
        hasRole,
    };
}