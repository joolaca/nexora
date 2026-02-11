// src/app/queryClient.ts
import { QueryClient, QueryCache, MutationCache } from "@tanstack/react-query";
import { clearToken } from "../auth/tokenStorage";

function handleUnauthorized() {
    clearToken();
    window.location.replace("/login");
}

function isUnauthorized(error: any) {
    return error?.statusCode === 401;
}

export const queryClient = new QueryClient({
    queryCache: new QueryCache({
        onError: (error) => {
            if (isUnauthorized(error)) handleUnauthorized();
        },
    }),
    mutationCache: new MutationCache({
        onError: (error) => {
            if (isUnauthorized(error)) handleUnauthorized();
        },
    }),
    defaultOptions: {
        queries: {
            staleTime: 10_000,
            refetchOnWindowFocus: false,
            retry: (failureCount, error: any) => {
                if (isUnauthorized(error)) return false;
                return failureCount < 1;
            },
        },
    },
});
