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
import { ClanRequestsPage } from "../clans/requests/components/ClanRequestsPage";

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
                        path: "/clan",
                        element: <ClanLayout />,
                        children: [
                            { index: true, element: <ClanOverviewPage /> },
                            { path: "requests", element: <ClanRequestsPage /> },
                        ],
                    },

                    { path: "/users", element: <UsersPage /> },
                ],
            },
        ],
    },
]);
