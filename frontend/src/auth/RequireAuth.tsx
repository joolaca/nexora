import { Navigate, Outlet } from "react-router-dom";
import { getToken } from "./tokenStorage";
import { useMe } from "./authHooks";
import { useTranslation } from "react-i18next";

export function RequireAuth() {
    const { t } = useTranslation();
    const token = getToken();
    const me = useMe();

    if (!token) return <Navigate to="/login" replace />;

    if (me.isLoading) return <div style={{ padding: 24 }}>{t("common.loading")}</div>;

    if (me.isError) return <Navigate to="/login" replace />;

    return <Outlet />;
}
