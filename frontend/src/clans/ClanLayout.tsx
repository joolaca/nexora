// src/clans/ClanLayout.tsx
import { NavLink, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";

function tabClass({ isActive }: { isActive: boolean }) {
    return `nav-link${isActive ? " active" : ""}`;
}

export function ClanLayout() {
    const { t } = useTranslation("clan");

    return (
        <div className="container">
            <div className="d-flex align-items-center justify-content-between mb-3">
                <h1 className="h4 mb-0">{t("menu.title")}</h1>
            </div>

            <ul className="nav nav-tabs mb-3">
                <li className="nav-item">
                    <NavLink to="/clan" end className={tabClass}>
                        {t("menu.overview")}
                    </NavLink>
                </li>

                <li className="nav-item">
                    <NavLink to="requests/invite" className={tabClass}>
                        {t("menu.requests")}
                    </NavLink>
                </li>
            </ul>

            <Outlet />
        </div>
    );
}
