import { createBrowserRouter } from "react-router-dom";
import { LoginPage } from "../pages/LoginPage";
import { DashboardPage } from "../pages/DashboardPage";
import { RequireAuth } from "../auth/RequireAuth";

export const router = createBrowserRouter([
    { path: "/login", element: <LoginPage /> },
    {
        element: <RequireAuth />,
        children: [
            { path: "/", element: <DashboardPage /> },
        ],
    },
]);
