// src/app/App.tsx
import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { NotificationsProvider } from "../notifications/NotificationsProvider";
import { queryClient } from "./queryClient";

export function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <NotificationsProvider>
                <RouterProvider router={router} />
            </NotificationsProvider>
        </QueryClientProvider>
    );
}