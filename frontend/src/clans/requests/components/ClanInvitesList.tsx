// frontend/src/clans/requests/components/ClanInvitesList.tsx
import { useTranslation } from "react-i18next";
import { useClanInviteList, useRevokeClanInvite } from "../hooks/requests.hooks";

function formatDate(iso: string) {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString();
}

export function ClanInvitesList() {
    const { t } = useTranslation("clan");
    const list = useClanInviteList();
    const revoke = useRevokeClanInvite();

    if (list.isLoading) {
        return <div className="text-muted">{t("request.invites.loading")}</div>;
    }

    if (list.isError) {
        return <div className="alert alert-danger">{t("request.invites.error")}</div>;
    }

    const items = list.data ?? [];
    if (items.length === 0) {
        return <div className="text-muted">{t("request.invites.empty")}</div>;
    }

    return (
        <div className="card mb-3">
            <div className="card-body">
                <div className="d-flex align-items-center justify-content-between mb-3">
                    <h2 className="h6 mb-0">{t("request.invites.title")}</h2>
                </div>

                <div className="table-responsive">
                    <table className="table table-sm align-middle mb-0">
                        <thead>
                        <tr>
                            <th>{t("request.invites.columns.user")}</th>
                            <th>{t("request.invites.columns.createdAt")}</th>
                            <th className="text-end">
                                {t("request.invites.columns.actions")}
                            </th>
                        </tr>
                        </thead>

                        <tbody>
                        {items.map((x) => (
                            <tr key={x.requestId}>
                                <td>
                                    <div className="fw-semibold">
                                        {x.username ?? t("request.invites.unknownUser")}
                                    </div>
                                    <div className="text-muted small font-monospace">
                                        {x.userId}
                                    </div>
                                </td>

                                <td>{formatDate(x.createdAt)}</td>

                                <td className="text-end">
                                    <button
                                        className="btn btn-outline-danger btn-sm"
                                        disabled={revoke.isPending}
                                        onClick={() =>
                                            revoke.mutate({ requestId: x.requestId })
                                        }
                                    >
                                        {revoke.isPending
                                            ? t("request.invites.revoking")
                                            : t("request.invites.revoke")}
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                {revoke.isError && (
                    <div className="alert alert-warning mt-3 mb-0">
                        {t("request.invites.revokeError")}
                    </div>
                )}
            </div>
        </div>
    );
}
