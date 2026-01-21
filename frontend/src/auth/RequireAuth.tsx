import { Navigate, Outlet } from "react-router-dom";
import { getToken } from "./tokenStorage";
import { useMe } from "./authHooks";

export function RequireAuth() {
    const token = getToken();
    const me = useMe();

    // nincs token -> login
    if (!token) return <Navigate to="/login" replace />;

    // van token, de még töltjük a profilt
    if (me.isLoading) return <div style={{ padding: 24 }}>Loading...</div>;

    // ha /me hibázott (pl. token invalid) -> login
    if (me.isError) return <Navigate to="/login" replace />;

    return <Outlet />;
}
