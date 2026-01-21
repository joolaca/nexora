import { useMe, useLogout } from "../auth/authHooks";

export function DashboardPage() {
    const me = useMe();
    const logout = useLogout();

    return (
        <div style={{ padding: 24, maxWidth: 520 }}>
            <h2>Dashboard ✅</h2>

            <div style={{ marginBottom: 12 }}>
                <button onClick={logout}>Logout</button>{" "}
                <button onClick={() => me.refetch()}>Reload profile</button>
            </div>

            {me.isLoading && <p>Loading profile...</p>}

            {me.data && (
                <pre style={{ padding: 12, border: "1px solid #ddd", borderRadius: 8, whiteSpace: "pre-wrap" }}>
          {JSON.stringify(me.data, null, 2)}
        </pre>
            )}

            {me.isError && <p style={{ color: "red" }}>Failed to load profile</p>}
        </div>
    );
}
