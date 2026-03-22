// src/user-details/UserDetailsRoute.tsx
import { Outlet } from "react-router-dom";
import { UserDetailsRoot } from "./UserDetailsRoot";

export function UserDetailsRoute() {
    return (
        <UserDetailsRoot>
            <Outlet />
        </UserDetailsRoot>
    );
}