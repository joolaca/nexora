import { useMe, useLogout } from "../auth/authHooks";

export function DashboardPage() {
    const me = useMe();

    return (
        <div className="row">
            <div className="col-12 col-lg-8">
                <div className="card shadow-sm">
                    <div className="card-body">
                        <div className="d-flex align-items-center justify-content-between mb-3">
                            <h2 className="h4 m-0">Dashboard ✅</h2>

                            <div className="d-flex gap-2">
                                <button className="btn btn-outline-secondary btn-sm" onClick={() => me.refetch()}>
                                    Reload profile
                                </button>
                            </div>
                        </div>

                        {me.isLoading && <div className="text-muted">Loading profile...</div>}

                        {me.data && (
                            <pre className="bg-light p-3 rounded border small" style={{ whiteSpace: "pre-wrap" }}>
              {JSON.stringify(me.data, null, 2)}
            </pre>
                        )}

                        {me.isError && <div className="alert alert-danger">Failed to load profile</div>}
                    </div>
                </div>
            </div>
        </div>
    );

}
