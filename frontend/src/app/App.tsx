// src/app/App.tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { NotificationsProvider } from "../notifications/NotificationsProvider";

const queryClient = new QueryClient();

export function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <NotificationsProvider>
                <RouterProvider router={router} />
            </NotificationsProvider>
        </QueryClientProvider>
    );
}