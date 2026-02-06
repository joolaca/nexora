// src/auth/authApi.ts
import { apiFetch } from "../api/http";

export type LoginResponse = {
    token: string;
    user: { id: string; username: string };
};

export type MeResponse = {
    id: string;
    username: string;
};

export type UpdateMeRequest = {
    currentPassword: string;
    newUsername?: string;
    newPassword?: string;
};

export type UpdateMeResponse = {
    id: string;
    username: string;
};

export function loginApi(username: string, password: string) {
    return apiFetch<LoginResponse>("/auth/login", { method: "POST", body: { username, password } });
}

export function meApi() {
    return apiFetch<MeResponse>("/auth/me", { method: "GET" });
}

export function updateMeApi(body: UpdateMeRequest) {
    return apiFetch<UpdateMeResponse>("/users/me", { method: "PATCH", body });
}
