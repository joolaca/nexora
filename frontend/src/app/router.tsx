// src/app/router.tsx
import { createBrowserRouter } from "react-router-dom";
import { LoginPage } from "../pages/LoginPage";
import { DashboardPage } from "../pages/DashboardPage";
import { RequireAuth } from "../auth/RequireAuth";
import { AuthLayout } from "../layouts/AuthLayout";
import { AppLayout } from "../layouts/AppLayout";
import { SettingsPage } from "../pages/SettingsPage";
import { UsersPage } from "../users/components/UsersPage";
import { ClanLayout } from "../clans/ClanLayout";
import { ClanOverviewPage } from "../clans/overview/pages/ClanOverviewPage";
import { ClanInvitesList } from "../clans/requests/components/ClanInvitesList";
import { RequireRole } from "../auth/RequireRole";
import { AdminPage } from "../admin/AdminPage";
import { UserDetailsRoute } from "../user-details/UserDetailsRoute";


export const router = createBrowserRouter([
    {
        element: <AuthLayout />,
        children: [{ path: "/login", element: <LoginPage /> }],
    },
    {
        element: <RequireAuth />,
        children: [
            {
                element: <AppLayout />,
                children: [
                    { path: "/", element: <DashboardPage /> },
                    { path: "/settings", element: <SettingsPage /> },
                    {
                        element: <UserDetailsRoute />,
                        children: [
                            { path: "/users", element: <UsersPage /> },
                        ],
                    },

                    {
                        path: "/clan",
                        element: <ClanLayout />,
                        children: [
                            { index: true, element: <ClanOverviewPage /> },
                            {
                                path: "requests/invite",
                                element: <ClanInvitesList />,
                            },
                        ],
                    },

                    {
                        element: <RequireRole role="admin" />,
                        children: [
                            {
                                path: "/admin",
                                element: <AdminPage />,
                            },
                        ],
                    },
                ],
            },
        ],
    },
]);