// src/app/router.tsx
import { createBrowserRouter } from "react-router-dom";
import { LoginPage } from "../pages/LoginPage";
import { DashboardPage } from "../pages/DashboardPage";
import { RequireAuth } from "../auth/RequireAuth";
import { AuthLayout } from "../layouts/AuthLayout";
import { AppLayout } from "../layouts/AppLayout";
import { SettingsPage } from "../pages/SettingsPage";
import { ClanPage } from "../clan/components/ClanPage";
import { UsersPage } from "../users/components/UsersPage";

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
                    { path: "/clan", element: <ClanPage /> },
                    { path: "/users", element: <UsersPage /> },
                ],
            },
        ],
    },
]);
