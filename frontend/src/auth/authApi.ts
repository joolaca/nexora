//frontend/src/auth/authApi.ts
import { apiFetch } from "../api/http";

export type UserRole = "admin" | "user";

export type AuthUser = {
    id: string;
    username: string;
    role: UserRole;
};

export type LoginResponse = {
    token: string;
    user: AuthUser;
};

export type MeResponse = AuthUser;

export type UpdateMeRequest = {
    currentPassword: string;
    newUsername?: string;
    newPassword?: string;
};

export type UpdateMeResponse = AuthUser;

export type RegisterRequest = {
    username: string;
    password: string;
};

export type RegisterResponse = {
    message?: string;
};

export function loginApi(username: string, password: string) {
    return apiFetch<LoginResponse>("/auth/login", {
        method: "POST",
        body: { username, password },
    });
}

export function registerApi(username: string, password: string) {
    return apiFetch<RegisterResponse>("/auth/register", {
        method: "POST",
        body: { username, password },
    });
}

export function meApi() {
    return apiFetch<MeResponse>("/auth/me", { method: "GET" });
}

export function updateMeApi(body: UpdateMeRequest) {
    return apiFetch<UpdateMeResponse>("/users/me", {
        method: "PATCH",
        body,
    });
}