// src/pages/LoginPage.tsx
import { FormEvent, useMemo, useState } from "react";
import { useAuth, useLogin } from "../auth/authHooks";
import { Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { translateApiError } from "../i18n/translateApiError";

const AUTH_FLASH_KEY = "auth_error_flash";

export function LoginPage() {
    const { t } = useTranslation();
    const auth = useAuth();
    const [username, setUsername] = useState("user1");
    const [password, setPassword] = useState("123");
    const login = useLogin();

    const flashError = useMemo(() => {
        const msg = sessionStorage.getItem(AUTH_FLASH_KEY);
        if (msg) sessionStorage.removeItem(AUTH_FLASH_KEY);
        return msg || "";
    }, []);

    if (auth.isLoading) {
        return <div className="text-center py-4">{t("common.loading")}</div>;
    }

    if (auth.isAuthenticated) {
        return <Navigate to="/" replace />;
    }

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
                        <label htmlFor="username" className="form-label">
                            {t("login.username")}
                        </label>
                        <input
                            id="username"
                            className="form-control"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            autoComplete="username"
                        />
                    </div>

                    <div className="mb-3">
                        <label htmlFor="password" className="form-label">
                            {t("login.password")}
                        </label>
                        <input
                            id="password"
                            className="form-control"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="current-password"
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