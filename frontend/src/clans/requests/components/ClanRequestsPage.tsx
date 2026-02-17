// src/clans/requests/components/ClanRequestsPage.tsx
import { useTranslation } from "react-i18next";
import { useAcceptClanRequest, useMyClanRequests, useRejectClanRequest } from "../hooks/requests.hooks";
import type { ClanRequestListItem } from "../api/requests.types";

function formatDate(iso: string) {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString();
}

function TypeLabel({ type }: { type: ClanRequestListItem["type"] }) {
    const { t } = useTranslation("clan");
    return <>{t(`request.type.${type}`)}</>;
}

function normalizeStatusForI18n(status: ClanRequestListItem["status"]) {
    // régi front key: CANCELED, backend: CANCELLED
    return status === "CANCELLED" ? "CANCELED" : status;
}

function StatusLabel({ status }: { status: ClanRequestListItem["status"] }) {
    const { t } = useTranslation("clan");
    const key = normalizeStatusForI18n(status);
    return <>{t(`request.status.${key}`)}</>;
}

export function ClanRequestsPage() {
    const { t } = useTranslation("clan");

    const list = useMyClanRequests();
    const accept = useAcceptClanRequest();
    const reject = useRejectClanRequest();

    if (list.isLoading) {
        return <div className="text-muted">{t("request.loading")}</div>;
    }

    if (list.isError) {
        return <div className="alert alert-danger">{t("request.error")}</div>;
    }

    const items = list.data ?? [];

    if (items.length === 0) {
        return <div className="text-muted">{t("request.empty")}</div>;
    }

    return (
        <div className="card">
            <div className="card-body">
                <div className="d-flex align-items-center justify-content-between mb-3">
                    <h2 className="h6 mb-0">{t("request.title")}</h2>
                </div>

                <div className="table-responsive">
                    <table className="table table-sm align-middle mb-0">
                        <thead>
                        <tr>
                            <th>{t("request.columns.requestId")}</th>
                            <th>{t("request.columns.clanId")}</th>
                            <th>{t("request.columns.type")}</th>
                            <th>{t("request.columns.status")}</th>
                            <th>{t("request.columns.createdAt")}</th>
                            <th className="text-end">{t("request.columns.actions")}</th>
                        </tr>
                        </thead>
                        <tbody>
                        {items.map((r) => {
                            const isPending = r.status === "PENDING";

                            return (
                                <tr key={r.requestId}>
                                    <td className="font-monospace">{r.requestId}</td>
                                    <td className="font-monospace">{r.clanId}</td>
                                    <td>
                                        <TypeLabel type={r.type} />
                                    </td>
                                    <td>
                                        <StatusLabel status={r.status} />
                                    </td>
                                    <td>{formatDate(r.createdAt)}</td>
                                    <td className="text-end">
                                        <div className="btn-group btn-group-sm" role="group">
                                            <button
                                                className="btn btn-success"
                                                disabled={!isPending || accept.isPending}
                                                onClick={() => accept.mutate({ requestId: r.requestId })}
                                            >
                                                {accept.isPending ? t("request.accepting") : t("request.accept")}
                                            </button>
                                            <button
                                                className="btn btn-outline-danger"
                                                disabled={!isPending || reject.isPending}
                                                onClick={() => reject.mutate({ requestId: r.requestId })}
                                            >
                                                {reject.isPending ? t("request.rejecting") : t("request.reject")}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                </div>

                {(accept.isError || reject.isError) && (
                    <div className="alert alert-warning mt-3 mb-0">{t("request.actionError")}</div>
                )}
            </div>
        </div>
    );
}
