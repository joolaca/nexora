//frontend/src/user-details/UserDetailsContext.tsx
import { createContext, useContext, useState, ReactNode } from "react";

type UserDetailsContextType = {
    userId: string | null;
    openUser: (id: string) => void;
    close: () => void;
};

const UserDetailsContext = createContext<UserDetailsContextType | null>(null);

export function UserDetailsProvider({ children }: { children: ReactNode }) {
    const [userId, setUserId] = useState<string | null>(null);

    const openUser = (id: string) => setUserId(id);
    const close = () => setUserId(null);

    return (
        <UserDetailsContext.Provider value={{ userId, openUser, close }}>
            {children}
        </UserDetailsContext.Provider>
    );
}

export function useUserDetails() {
    const ctx = useContext(UserDetailsContext);
    if (!ctx) throw new Error("useUserDetails must be used inside provider");
    return ctx;
}