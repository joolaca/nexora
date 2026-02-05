import { useMe } from "../auth/authHooks";
import { useTranslation } from "react-i18next";

export function DashboardPage() {
    const { t } = useTranslation();
    const me = useMe();

    return (
        <div className="row">
            <div className="col-12 col-lg-8">
                <div className="card shadow-sm">
                    <div className="card-body">
                        <div className="d-flex align-items-center justify-content-between mb-3">
                            <h2 className="h4 m-0">{t("dashboard.title")}</h2>

                            <div className="d-flex gap-2">
                                <button className="btn btn-outline-secondary btn-sm" onClick={() => me.refetch()}>
                                    {t("dashboard.reloadProfile")}
                                </button>
                            </div>
                        </div>

                        {me.isLoading && <div className="text-muted">{t("dashboard.loadingProfile")}</div>}

                        {me.data && (
                            <pre className="bg-light p-3 rounded border small" style={{ whiteSpace: "pre-wrap" }}>
                {JSON.stringify(me.data, null, 2)}
              </pre>
                        )}

                        {me.isError && <div className="alert alert-danger">{t("dashboard.failedProfile")}</div>}
                    </div>
                </div>
            </div>
        </div>
    );
}
