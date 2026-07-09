import { NavLink, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useMyClan } from "./overview/hooks/overview.hooks";
import { canManageClanRequests } from "./permissions/clan-permissions.service";

function tabClass({ isActive }: { isActive: boolean }) {
    return `nav-link${isActive ? " active" : ""}`;
}

export function ClanLayout() {
    const { t } = useTranslation("clan");
    const myClan = useMyClan();


    const showRequestsMenu = canManageClanRequests(myClan.data);

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

                {showRequestsMenu && (
                    <li className="nav-item">
                        <NavLink to="requests/invite" className={tabClass}>
                            {t("menu.requests")}
                        </NavLink>
                    </li>
                )}


                <li className="nav-item">
                    <NavLink to="my-invites" className={tabClass}>
                        {t("menu.myInvites")}
                    </NavLink>
                </li>

            </ul>

            <Outlet />
        </div>
    );
}