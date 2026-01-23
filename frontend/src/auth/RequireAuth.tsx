import { Navigate, Outlet } from "react-router-dom";
import { getToken } from "./tokenStorage";
import { useMe } from "./authHooks";

export function RequireAuth() {
    const token = getToken();
    const me = useMe();

    if (!token) return <Navigate to="/login" replace />;

    if (me.isLoading) return <div style={{ padding: 24 }}>Loading...</div>;

    if (me.isError) return <Navigate to="/login" replace />;

    return <Outlet />;
}
