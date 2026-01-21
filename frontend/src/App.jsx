import { useEffect, useState } from "react";

// Külön komponens: Login képernyő
function LoginView({ username, setUsername, password, setPassword, error, onLogin }) {
    return (
        <div style={{ padding: 24, maxWidth: 360 }}>
            <h2>Nexora Login</h2>
            <form onSubmit={onLogin}>
                <div style={{ marginBottom: 12 }}>
                    <label>Username</label>
                    <input
                        style={{ width: "100%" }}
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>

                <div style={{ marginBottom: 12 }}>
                    <label>Password</label>
                    <input
                        style={{ width: "100%" }}
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                {error && <p style={{ color: "red" }}>{error}</p>}

                <button style={{ width: "100%" }} type="submit">
                    Login
                </button>
            </form>
        </div>
    );
}

// Külön komponens: Bejelentkezett képernyő
function DashboardView({ me, loadingMe, error, onLogout, onReloadMe }) {
    return (
        <div style={{ padding: 24, maxWidth: 520 }}>
            <h2>Logged in ✅</h2>

            <div style={{ marginBottom: 12 }}>
                <button onClick={onLogout}>Logout</button>{" "}
                <button onClick={onReloadMe}>Reload profile</button>
            </div>

            {loadingMe && <p>Loading profile...</p>}

            {!loadingMe && me && (
                <div style={{ padding: 12, border: "1px solid #ddd", borderRadius: 8 }}>
                    <div style={{ marginBottom: 8 }}>
                        <b>Profile</b>
                    </div>
                    <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
                        {JSON.stringify(me, null, 2)}
                    </pre>
                </div>
            )}

            {!loadingMe && !me && <p>No profile loaded yet.</p>}

            {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
    );
}

export default function App() {
    // Login form state
    const [username, setUsername] = useState("user1");
    const [password, setPassword] = useState("123");

    // Auth state
    const [token, setToken] = useState(localStorage.getItem("token") || "");
    const [error, setError] = useState("");

    // "Me" state
    const [me, setMe] = useState(null);
    const [loadingMe, setLoadingMe] = useState(false);

    // API helper: mindig hozzáteszi a tokent ha van
    const apiFetch = async (url, options = {}) => {
        const headers = {
            "Content-Type": "application/json",
            ...(options.headers || {}),
        };

        if (token) headers.Authorization = `Bearer ${token}`;

        const res = await fetch(url, { ...options, headers });

        // próbáljuk JSON-ként olvasni (de ne törjön meg ha nem JSON)
        let data = null;
        const contentType = res.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
            data = await res.json();
        } else {
            data = { message: await res.text() };
        }

        return { res, data };
    };

    const login = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const { res, data } = await apiFetch("/auth/login", {
                method: "POST",
                body: JSON.stringify({ username, password }),
            });

            if (!res.ok) {
                setError(data?.message || "Login failed");
                return;
            }

            localStorage.setItem("token", data.token);
            setToken(data.token);
        } catch (err) {
            setError("Network error");
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        setToken("");
        setMe(null);
        setError("");
    };

    const loadMe = async () => {
        if (!token) return;

        setLoadingMe(true);
        setError("");

        try {
            // FONTOS: ehhez kell backend oldalon egy GET /auth/me
            const { res, data } = await apiFetch("/auth/me", { method: "GET" });

            if (res.status === 401) {
                // token lejárt / hibás -> automatikus logout
                logout();
                return;
            }

            if (!res.ok) {
                setError(data?.message || "Failed to load profile");
                return;
            }

            setMe(data);
        } catch (err) {
            setError("Network error while loading profile");
        } finally {
            setLoadingMe(false);
        }
    };

    // token változáskor automatikusan töltsük be a profilt
    useEffect(() => {
        if (token) loadMe();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    // Render
    if (token) {
        return (
            <DashboardView
                me={me}
                loadingMe={loadingMe}
                error={error}
                onLogout={logout}
                onReloadMe={loadMe}
            />
        );
    }

    return (
        <LoginView
            username={username}
            setUsername={setUsername}
            password={password}
            setPassword={setPassword}
            error={error}
            onLogin={login}
        />
    );
}
