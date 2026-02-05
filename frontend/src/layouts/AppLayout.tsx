import { NavLink, Outlet } from "react-router-dom";
import { useLogout } from "../auth/authHooks";
import { useTranslation } from "react-i18next";
import { setLanguage } from "../i18n/i18n";

function navLinkClass({ isActive }: { isActive: boolean }) {
    return `nav-link${isActive ? " active" : ""}`;
}

export function AppLayout() {
    const logout = useLogout();
    const { t, i18n } = useTranslation();

    const current = (i18n.language === "hu" ? "hu" : "en") as "hu" | "en";

    return (
        <div>
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
                <div className="container">
                    <NavLink className="navbar-brand" to="/">
                        {t("app.name")}
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
                                    {t("nav.dashboard")}
                                </NavLink>
                            </li>
                        </ul>

                        <div className="d-flex gap-2 align-items-center">
                            <select
                                className="form-select form-select-sm"
                                style={{ width: 140 }}
                                value={current}
                                onChange={(e) => setLanguage(e.target.value as "hu" | "en")}
                                aria-label={t("nav.language")}
                            >
                                <option value="hu">Magyar</option>
                                <option value="en">English</option>
                            </select>

                            <button className="btn btn-outline-light" onClick={logout}>
                                {t("nav.logout")}
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="container py-4">
                <Outlet />
            </main>
        </div>
    );
}
