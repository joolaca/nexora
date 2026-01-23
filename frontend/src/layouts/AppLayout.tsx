import { NavLink, Outlet } from "react-router-dom";
import { useLogout } from "../auth/authHooks";

function navLinkClass({ isActive }: { isActive: boolean }) {
    return `nav-link${isActive ? " active" : ""}`;
}

export function AppLayout() {
    const logout = useLogout();

    return (
        <div>
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
                <div className="container">
                    <NavLink className="navbar-brand" to="/">
                        Nexora
                    </NavLink>

                    <button
                        className="navbar-toggler"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#mainNav"
                        aria-controls="mainNav"
                        aria-expanded="false"
                        aria-label="Toggle navigation"
                    >
                        <span className="navbar-toggler-icon" />
                    </button>

                    <div className="collapse navbar-collapse" id="mainNav">
                        <ul className="navbar-nav me-auto">
                            <li className="nav-item">
                                <NavLink className={navLinkClass} to="/">
                                    Dashboard
                                </NavLink>
                            </li>


                        </ul>

                        <button className="btn btn-outline-light" onClick={logout}>
                            Logout
                        </button>
                    </div>
                </div>
            </nav>

            <main className="container py-4">
                <Outlet />
            </main>
        </div>
    );
}
