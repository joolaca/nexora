import { FormEvent, useMemo, useState } from "react";
import { useLogin } from "../auth/authHooks";
import { Navigate } from "react-router-dom";
import { getToken } from "../auth/tokenStorage";
import { useTranslation } from "react-i18next";
import { translateApiError } from "../i18n/translateApiError";

const AUTH_FLASH_KEY = "auth_error_flash";

export function LoginPage() {
    const { t } = useTranslation();
    const [username, setUsername] = useState("user11");
    const [password, setPassword] = useState("123");
    const login = useLogin();

    // ✅ egyszer kiolvassuk (hogy ne maradjon bent)
    const flashError = useMemo(() => {
        const msg = sessionStorage.getItem(AUTH_FLASH_KEY);
        if (msg) sessionStorage.removeItem(AUTH_FLASH_KEY);
        return msg || "";
    }, []);

    if (getToken()) return <Navigate to="/" replace />;

    const onSubmit = (e: FormEvent) => {
        e.preventDefault();
        login.mutate({ username, password });
    };

    const errorMsg = login.isError ? translateApiError(login.error, t, "login.failed") : "";
    const visibleError = errorMsg || flashError;

    return (
        <div className="card shadow-sm">
            <div className="card-body">
                <h2 className="h4 mb-3">{t("login.title")}</h2>

                <form onSubmit={onSubmit}>
                    <div className="mb-3">
                        <label className="form-label">{t("login.username")}</label>
                        <input className="form-control" value={username} onChange={(e) => setUsername(e.target.value)} />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">{t("login.password")}</label>
                        <input
                            className="form-control"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    {!!visibleError && <div className="alert alert-danger py-2">{visibleError}</div>}

                    <button className="btn btn-primary w-100" type="submit" disabled={login.isPending}>
                        {login.isPending ? t("login.pending") : t("login.submit")}
                    </button>
                </form>
            </div>
        </div>
    );
}
