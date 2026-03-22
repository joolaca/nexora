// src/users/components/UsersTable.tsx
import type { UserListItem } from "../usersApi";
import { useTranslation } from "react-i18next";
import { UserNameLink } from "../../user-details/UserNameLink";
import { useInviteToClan } from "../../clans/requests/hooks/requests.hooks";
import { useMyClan } from "../../clans/overview/hooks/overview.hooks";

type Props = {
    users: UserListItem[];
};

export function UsersTable({ users }: Props) {
    const { t } = useTranslation("user");
    const { t: tc } = useTranslation("clan");

    const { data: myClan } = useMyClan();
    const invite = useInviteToClan();

    const canInvite = !!myClan?.id;

    const handleInvite = (userId: string) => {
        if (!myClan?.id) return;

        invite.mutate({
            clanId: myClan.id,
            body: { userId },
        });
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

            {/* TEMP feedback */}
            {invite.isError && (
                <div className="alert alert-danger m-2">
                    {tc("invite.error")}
                </div>
            )}

            {invite.isSuccess && (
                <div className="alert alert-success m-2">
                    {tc("invite.success")}
                </div>
            )}
        </div>
    );
}