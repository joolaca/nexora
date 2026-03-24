//frontend/src/pages/LoginPage.tsx
import { FormEvent, useMemo, useState } from "react";
import { useAuth, useLogin, useRegister } from "../auth/authHooks";
import { Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { translateApiError } from "../i18n/translateApiError";

const AUTH_FLASH_KEY = "auth_error_flash";

type AuthMode = "login" | "register";

export function LoginPage() {
    const { t } = useTranslation();
    const auth = useAuth();

    const [mode, setMode] = useState<AuthMode>("login");
    const [username, setUsername] = useState("user1");
    const [password, setPassword] = useState("123");
    const [successMessage, setSuccessMessage] = useState("");

    const login = useLogin();
    const register = useRegister();

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
        setSuccessMessage("");

        if (mode === "login") {
            login.mutate({ username, password });
            return;
        }

        register.mutate(
            { username, password },
            {
                onSuccess: () => {
                    setSuccessMessage("Sikeres regisztráció. Most már be tudsz jelentkezni.");
                    setMode("login");
                },
            }
        );
    };

    const loginError =
        mode === "login" && login.isError
            ? translateApiError(login.error, t, "login.failed")
            : "";

    const registerError =
        mode === "register" && register.isError
            ? translateApiError(register.error, t, "register.failed")
            : "";

    const visibleError = loginError || registerError || flashError;
    const isPending = mode === "login" ? login.isPending : register.isPending;

    return (
        <div className="card shadow-sm">
            <div className="card-body">
                <div className="d-flex gap-2 mb-3">
                    <button
                        type="button"
                        className={`btn ${mode === "login" ? "btn-primary" : "btn-outline-primary"}`}
                        onClick={() => {
                            setMode("login");
                            setSuccessMessage("");
                        }}
                    >
                        {t("login.title")}
                    </button>

                    <button
                        type="button"
                        className={`btn ${mode === "register" ? "btn-primary" : "btn-outline-primary"}`}
                        onClick={() => {
                            setMode("register");
                            setSuccessMessage("");
                        }}
                    >
                        Regisztráció
                    </button>
                </div>

                <h2 className="h4 mb-3">
                    {mode === "login" ? t("login.title") : "Regisztráció"}
                </h2>

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
                            autoComplete={mode === "login" ? "current-password" : "new-password"}
                        />
                    </div>

                    {!!successMessage && (
                        <div className="alert alert-success py-2">{successMessage}</div>
                    )}

                    {!!visibleError && (
                        <div className="alert alert-danger py-2">{visibleError}</div>
                    )}

                    <button className="btn btn-primary w-100" type="submit" disabled={isPending}>
                        {isPending
                            ? mode === "login"
                                ? t("login.pending")
                                : "Regisztráció folyamatban..."
                            : mode === "login"
                                ? t("login.submit")
                                : "Regisztráció"}
                    </button>
                </form>
            </div>
        </div>
    );
}