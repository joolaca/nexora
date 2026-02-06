// src/pages/SettingsPage.tsx
import { FormEvent, useMemo, useState } from "react";
import { useMe, useUpdateMe } from "../auth/authHooks";
import { useTranslation } from "react-i18next";
import { translateApiError } from "../i18n/translateApiError";


export function SettingsPage() {
    const { t } = useTranslation();
    const me = useMe();
    const update = useUpdateMe();

    const [newUsername, setNewUsername] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");

    const canSubmit = useMemo(() => {
        const hasChange = newUsername.trim().length > 0 || newPassword.length > 0;
        return hasChange && currentPassword.length > 0 && !update.isPending;
    }, [newUsername, newPassword, currentPassword, update.isPending]);

    const onSubmit = (e: FormEvent) => {
        e.preventDefault();

        update.mutate({
            currentPassword,
            newUsername: newUsername.trim() ? newUsername.trim() : undefined,
            newPassword: newPassword ? newPassword : undefined,
        });
    };

    const errorMsg = update.isError ? translateApiError(update.error, t, "settings.failed") : "";
    const okMsg = t("settings.success");

    return (
        <div className="row">
            <div className="col-12 col-lg-8">
                <div className="card shadow-sm">
                    <div className="card-body">
                        <h2 className="h4 mb-3">{t("settings.title")}</h2>

                        {me.data && (
                            <div className="alert alert-secondary py-2">
                                {t("settings.currentUser")}: <strong>{me.data.username}</strong>
                            </div>
                        )}

                        <form onSubmit={onSubmit}>
                            <div className="mb-3">
                                <label className="form-label">{t("settings.newUsername")}</label>
                                <input
                                    className="form-control"
                                    value={newUsername}
                                    onChange={(e) => setNewUsername(e.target.value)}
                                    placeholder={t("settings.newUsernamePh")}
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">{t("settings.newPassword")}</label>
                                <input
                                    className="form-control"
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder={t("settings.newPasswordPh")}
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">{t("settings.currentPassword")}</label>
                                <input
                                    className="form-control"
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    placeholder={t("settings.currentPasswordPh")}
                                    required
                                />
                            </div>

                            {update.isError && <div className="alert alert-danger py-2">{errorMsg}</div>}
                            {update.isSuccess && <div className="alert alert-success py-2">{okMsg}</div>}

                            <button className="btn btn-primary" type="submit" disabled={!canSubmit}>
                                {update.isPending ? t("settings.saving") : t("settings.save")}
                            </button>
                        </form>

                        <hr />

                        <div className="text-muted small">
                            {t("settings.hint")}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
