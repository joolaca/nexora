// src/user-details/UserDetailsRoot.tsx
import type { ReactNode } from "react";
import { UserDetailsProvider } from "./UserDetailsContext";
import { UserDetailsPanel } from "./UserDetailsPanel";

type Props = {
    children: ReactNode;
};

export function UserDetailsRoot({ children }: Props) {
    return (
        <UserDetailsProvider>
            {children}
            <UserDetailsPanel />
        </UserDetailsProvider>
    );
}