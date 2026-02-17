// src/users/components/UsersTable.tsx
import type { UserListItem } from "../usersApi";
import { useTranslation } from "react-i18next";

type Props = {
    users: UserListItem[];
    onSelect: (id: string) => void;
};

export function UsersTable({ users, onSelect }: Props) {
    const { t } = useTranslation("user");

    return (
        <div className="card shadow-sm">
            <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                    <tr>
                        <th style={{ width: 80 }}>{t("table.rank")}</th>
                        <th>{t("table.username")}</th>
                        <th style={{ width: 220 }}>{t("table.clans")}</th>
                        <th style={{ width: 120 }}>{t("table.actions")}</th>
                    </tr>
                    </thead>

                    <tbody>
                    {users.map((u) => (
                        <tr key={u.id}>
                            <td className="fw-semibold">{u.rank}</td>
                            <td>{u.username}</td>
                            <td>
                                {u.clan ? (
                                    <span className="badge text-bg-secondary">{u.clan.name}</span>
                                ) : (
                                    <span className="text-muted">{t("table.noClan")}</span>
                                )}
                            </td>
                            <td className="text-end">
                                <button className="btn btn-sm btn-outline-primary" onClick={() => onSelect(u.id)}>
                                    {t("table.details")}
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
