// src/users/components/UserDetailsPanel.tsx
import type { UserListItem } from "../usersApi";
import { useTranslation } from "react-i18next";

type Props = {
    user: UserListItem | null;
    isLoading: boolean;
};

export function UserDetailsPanel({ user, isLoading }: Props) {
    const { t } = useTranslation("user");

    if (isLoading) return <div className="text-muted">{t("panel.loading")}</div>;

    if (!user) {
        return <div className="text-muted">{t("panel.notFound")}</div>;
    }

    return (
        <>
            <div className="mb-2">
                <div className="text-muted small">{t("panel.username")}</div>
                <div className="fw-semibold">{user.username}</div>
            </div>

            <div className="mb-2">
                <div className="text-muted small">{t("panel.rank")}</div>
                <div className="fw-semibold">{user.rank}</div>
            </div>

            <div className="mb-3">
                <div className="text-muted small">{t("panel.clan")}</div>
                {user.clan ? (
                    <div className="fw-semibold">
                        {user.clan.name} <span className="text-muted">({user.clan.slug})</span>
                    </div>
                ) : (
                    <div className="text-muted">{t("panel.noClan")}</div>
                )}
            </div>

            <hr />

            {!user.clan ? (
                <button className="btn btn-primary w-100" disabled title={t("panel.inviteDisabledTitle")}>
                    {t("panel.inviteNext")}
                </button>
            ) : (
                <div className="alert alert-secondary py-2 mb-0">{t("panel.alreadyInClan")}</div>
            )}
        </>
    );
}
