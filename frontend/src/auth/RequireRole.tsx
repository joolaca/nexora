// src/auth/RequireRole.tsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./authHooks";
import type { UserRole } from "./authApi";

type RequireRoleProps = {
    role: UserRole;
};

export function RequireRole({ role }: RequireRoleProps) {
    const auth = useAuth();

    if (auth.isLoading) {
        return <div style={{ padding: 24 }}>Loading...</div>;
    }

    if (!auth.isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (!auth.hasRole(role)) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}