import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { loginApi, meApi } from "./authApi";
import { setToken, getToken, clearToken } from "./tokenStorage";

export const authKeys = {
    me: ["auth", "me"] as const,
};

export function useMe() {
    const token = getToken();
    return useQuery({
        queryKey: authKeys.me,
        queryFn: meApi,
        enabled: !!token,         // csak ha van token
        retry: false,             // auth-nál ne retry-zzon végtelenül
    });
}

export function useLogin() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: ({ username, password }: { username: string; password: string }) =>
            loginApi(username, password),
        onSuccess: async (data) => {
            setToken(data.token);
            // login után frissítjük a /me-t
            await qc.invalidateQueries({ queryKey: authKeys.me });
        },
    });
}

export function useLogout() {
    const qc = useQueryClient();
    return () => {
        clearToken();
        qc.removeQueries({ queryKey: authKeys.me });
    };
}
