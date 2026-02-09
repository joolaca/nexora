import { QueryClient } from "@tanstack/react-query";
import { clearToken } from "../auth/tokenStorage";

function handleUnauthorized() {
    clearToken();
    window.location.replace("/login");
}

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 10_000,
            refetchOnWindowFocus: false,
            retry: (failureCount, error: any) => {
                if (error?.statusCode === 401) return false;
                return failureCount < 1;
            },
        },
        mutations: {
            onError: (error: any) => {
                if (error?.statusCode === 401) handleUnauthorized();
            },
        },
    },
});
