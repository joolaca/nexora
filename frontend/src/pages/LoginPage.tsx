import { FormEvent, useState } from "react";
import { useLogin } from "../auth/authHooks";
import { Navigate } from "react-router-dom";
import { getToken } from "../auth/tokenStorage";

export function LoginPage() {
    const [username, setUsername] = useState("user1");
    const [password, setPassword] = useState("123");
    const login = useLogin();

    if (getToken()) return <Navigate to="/" replace />;

    const onSubmit = (e: FormEvent) => {
        e.preventDefault();
        login.mutate({ username, password });
    };

    const errorMsg =
        (login.error as any)?.message || "Login failed";

    return (
        <div style={{ padding: 24, maxWidth: 360 }}>
            <h2>Nexora Login</h2>

            <form onSubmit={onSubmit}>
                <div style={{ marginBottom: 12 }}>
                    <label>Username</label>
                    <input style={{ width: "100%" }} value={username} onChange={(e) => setUsername(e.target.value)} />
                </div>

                <div style={{ marginBottom: 12 }}>
                    <label>Password</label>
                    <input style={{ width: "100%" }} type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>

                {login.isError && <p style={{ color: "red" }}>{errorMsg}</p>}

                <button style={{ width: "100%" }} type="submit" disabled={login.isPending}>
                    {login.isPending ? "Logging in..." : "Login"}
                </button>
            </form>
        </div>
    );
}
