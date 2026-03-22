// src/notifications/NotificationsProvider.tsx
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";
import { NotificationsViewport } from "./NotificationsViewport";
import { registerNotificationBridge } from "./notificationBridge";

export type NotificationType = "success" | "error" | "info";

export type NotificationItem = {
    id: string;
    type: NotificationType;
    message: string;
};

type NotifyContextValue = {
    notify: {
        success: (message: string) => void;
        error: (message: string) => void;
        info: (message: string) => void;
    };
};

const NotificationsContext = createContext<NotifyContextValue | null>(null);

type Props = {
    children: ReactNode;
};

export function NotificationsProvider({ children }: Props) {
    const [items, setItems] = useState<NotificationItem[]>([]);

    const remove = useCallback((id: string) => {
        setItems((prev) => prev.filter((item) => item.id !== id));
    }, []);

    const push = useCallback((type: NotificationType, message: string) => {
        const id = `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

        setItems((prev) => [...prev, { id, type, message }]);

        window.setTimeout(() => {
            remove(id);
        }, 3500);
    }, [remove]);

    const value = useMemo<NotifyContextValue>(() => ({
        notify: {
            success: (message: string) => push("success", message),
            error: (message: string) => push("error", message),
            info: (message: string) => push("info", message),
        },
    }), [push]);

    useEffect(() => {
        registerNotificationBridge({
            success: value.notify.success,
            error: value.notify.error,
            info: value.notify.info,
        });
    }, [value]);

    return (
        <NotificationsContext.Provider value={value}>
            {children}
            <NotificationsViewport items={items} onClose={remove} />
        </NotificationsContext.Provider>
    );
}

export function useNotificationsContext() {
    const ctx = useContext(NotificationsContext);

    if (!ctx) {
        throw new Error("useNotificationsContext must be used inside NotificationsProvider");
    }

    return ctx;
}