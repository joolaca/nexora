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
        <div className="card shadow-sm">
            <div className="card-body">
                <h2 className="h4 mb-3">Nexora Login</h2>

                <form onSubmit={onSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Username</label>
                        <input
                            className="form-control"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Password</label>
                        <input
                            className="form-control"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    {login.isError && <div className="alert alert-danger py-2">{errorMsg}</div>}

                    <button className="btn btn-primary w-100" type="submit" disabled={login.isPending}>
                        {login.isPending ? "Logging in..." : "Login"}
                    </button>
                </form>
            </div>
        </div>
    );

}
