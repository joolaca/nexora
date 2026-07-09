// src/clans/my-requests/pages/MyClanInvitesPage.tsx

import { useTranslation } from "react-i18next";
import { useMyClan } from "../../overview/hooks/overview.hooks";
import {
    useAcceptMyClanInvite,
    useMyClanInvites,
    useRejectMyClanInvite,
} from "../hooks/my-clan-requests.hooks";

function formatDate(iso: string) {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString();
}

export function MyClanInvitesPage() {
    const { t } = useTranslation("clan");

    const myClan = useMyClan();
    const invites = useMyClanInvites();
    const accept = useAcceptMyClanInvite();
    const reject = useRejectMyClanInvite();

    const isInClan = !!myClan.data;

    if (invites.isLoading || myClan.isLoading) {
        return <div className="text-muted">{t("common.loading", { ns: "common" })}</div>;
    }

    if (invites.isError) {
        return <div className="alert alert-danger">{t("myInvites.error")}</div>;
    }

    const items = (invites.data ?? []).filter(
        (x) => x.type === "INVITE" && x.status === "PENDING"
    );

    return (
        <div className="card shadow-sm">
            <div className="card-body">
                <h2 className="h5 mb-3">{t("myInvites.title")}</h2>

                {isInClan && (
                    <div className="alert alert-info py-2">
                        {t("myInvites.alreadyInClan")}
                    </div>
                )}

                {items.length === 0 ? (
                    <div className="text-muted">{t("myInvites.empty")}</div>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-sm align-middle mb-0">
                            <thead>
                            <tr>
                                <th>{t("myInvites.columns.clan")}</th>
                                <th>{t("myInvites.columns.createdAt")}</th>
                                <th className="text-end">
                                    {t("myInvites.columns.actions")}
                                </th>
                            </tr>
                            </thead>

                            <tbody>
                            {items.map((x) => (
                                <tr key={x.requestId}>
                                    <td>
                                        <div className="fw-semibold">
                                            {x.clan.name ?? x.clanId}
                                        </div>

                                        {x.clanSlug && (
                                            <div className="text-muted small">
                                                {x.clanSlug}
                                            </div>
                                        )}
                                    </td>

                                    <td>{formatDate(x.createdAt)}</td>

                                    <td className="text-end">
                                        {isInClan ? (
                                            <span className="text-muted small">
                                                {t("myInvites.joinDisabled")}
                                            </span>
                                        ) : (
                                            <div className="d-flex gap-2 justify-content-end">
                                                <button
                                                    className="btn btn-success btn-sm"
                                                    disabled={accept.isPending || reject.isPending}
                                                    onClick={() =>
                                                        accept.mutate({ requestId: x.requestId })
                                                    }
                                                >
                                                    {accept.isPending
                                                        ? t("myInvites.accepting")
                                                        : t("myInvites.accept")}
                                                </button>

                                                <button
                                                    className="btn btn-outline-danger btn-sm"
                                                    disabled={accept.isPending || reject.isPending}
                                                    onClick={() =>
                                                        reject.mutate({ requestId: x.requestId })
                                                    }
                                                >
                                                    {reject.isPending
                                                        ? t("myInvites.rejecting")
                                                        : t("myInvites.reject")}
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {(accept.isError || reject.isError) && (
                    <div className="alert alert-warning mt-3 mb-0">
                        {t("myInvites.actionError")}
                    </div>
                )}
            </div>
        </div>
    );
}