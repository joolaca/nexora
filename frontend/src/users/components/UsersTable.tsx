// src/users/components/UsersTable.tsx
import type { UserListItem } from "../usersApi";
import { useTranslation } from "react-i18next";
import { UserNameLink } from "../../user-details/UserNameLink";
import { useInviteToClan } from "../../clans/requests/hooks/requests.hooks";
import { useMyClan } from "../../clans/overview/hooks/overview.hooks";
import { useNotify } from "../../notifications/useNotify";

type Props = {
    users: UserListItem[];
};

export function UsersTable({ users }: Props) {
    const { t } = useTranslation("user");
    const { t: tc } = useTranslation("clan");
    const notify = useNotify();

    const { data: myClan } = useMyClan();
    const invite = useInviteToClan();

    const canInvite = !!myClan?.id;

    const handleInvite = (userId: string) => {
        if (!myClan?.id) {
            notify.error(tc("invite.disabledTitle"));
            return;
        }

        invite.mutate(
            {
                clanId: myClan.id,
                body: { userId },
            },
            {
                onSuccess: () => {
                    notify.success(tc("invite.success"));
                },
                onError: () => {
                    notify.error(tc("invite.error"));
                },
            },
        );
    };

    return (
        <div className="card shadow-sm">
            <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                    <tr>
                        <th style={{ width: 80 }}>{t("table.rank")}</th>
                        <th>{t("table.username")}</th>
                        <th style={{ width: 220 }}>{t("table.clans")}</th>
                        <th style={{ width: 160 }}>{t("table.actions")}</th>
                    </tr>
                    </thead>

                    <tbody>
                    {users.map((u) => (
                        <tr key={u.id}>
                            <td className="fw-semibold">{u.rank}</td>

                            <td>
                                <UserNameLink userId={u.id} username={u.username} />
                            </td>

                            <td>
                                {u.clan ? (
                                    <span className="badge text-bg-secondary">
                                            {u.clan.name}
                                        </span>
                                ) : (
                                    <span className="text-muted">
                                            {t("table.noClan")}
                                        </span>
                                )}
                            </td>

                            <td>
                                <button
                                    type="button"
                                    className="btn btn-sm btn-primary"
                                    onClick={() => handleInvite(u.id)}
                                    disabled={!canInvite || invite.isPending}
                                    title={!canInvite ? tc("invite.disabledTitle") : undefined}
                                >
                                    {invite.isPending
                                        ? tc("invite.buttonInviting")
                                        : tc("invite.buttonNext")}
                                </button>
                            </td>
                        </tr>
                    ))}

                    {users.length === 0 && (
                        <tr>
                            <td colSpan={4} className="text-center text-muted py-4">
                                {t("table.empty")}
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}