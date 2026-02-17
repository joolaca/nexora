//src/auth/RequireAuth.tsx
import { Navigate, Outlet } from "react-router-dom";
import { getToken, clearToken } from "./tokenStorage";
import { useMe } from "./authHooks";
import { useTranslation } from "react-i18next";
import { ApiError } from "../api/types";

const AUTH_FLASH_KEY = "auth_error_flash";

export function RequireAuth() {
    const { t } = useTranslation();
    const token = getToken();
    const me = useMe();

    if (!token) return <Navigate to="/login" replace />;

    if (me.isLoading || me.isFetching) {
        return <div style={{ padding: 24 }}>{t("common.loading")}</div>;
    }

    if (me.isError) {
        const err = me.error as ApiError;

        if (err?.statusCode >= 500 && err?.statusCode < 600) {
            sessionStorage.setItem(
                AUTH_FLASH_KEY,
                err.message || t("login.failed") // ha nincs jobb kulcsod, ez jó alap
            );
            clearToken();
            return <Navigate to="/login" replace />;
        }

        clearToken();
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}
