// src/app/queryClient.ts
import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import i18n from "../i18n/i18n";
import { clearToken } from "../auth/tokenStorage";
import { getApiErrorMessage, isUnauthorizedError } from "../api/errorUtils";
import { notifyError } from "../notifications/notificationBridge";

function handleUnauthorized() {
    clearToken();

    if (window.location.pathname !== "/login") {
        window.location.replace("/login");
    }
}

function handleGlobalError(error: unknown) {
    if (isUnauthorizedError(error)) {
        handleUnauthorized();
        return;
    }

    const message = getApiErrorMessage(error, i18n.t.bind(i18n));
    notifyError(message);
}

export const queryClient = new QueryClient({
    queryCache: new QueryCache({
        onError: (error, query) => {
            if (query.meta?.skipGlobalError) return;
            handleGlobalError(error);
        },
    }),
    mutationCache: new MutationCache({
        onError: (error, _variables, _context, mutation) => {
            if (mutation.meta?.skipGlobalError) return;
            handleGlobalError(error);
        },
    }),
    defaultOptions: {
        queries: {
            staleTime: 10_000,
            refetchOnWindowFocus: false,
            retry: (failureCount, error) => {
                if (isUnauthorizedError(error)) return false;
                return failureCount < 1;
            },
        },
        mutations: {
            retry: false,
        },
    },
});