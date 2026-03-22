// src/notifications/useNotify.ts
import { useNotificationsContext } from "./NotificationsProvider";

export function useNotify() {
    return useNotificationsContext().notify;
}