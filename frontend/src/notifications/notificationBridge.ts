// src/notifications/notificationBridge.ts
type NotifyFn = (message: string) => void;

type NotificationBridge = {
    success?: NotifyFn;
    error?: NotifyFn;
    info?: NotifyFn;
};

const bridge: NotificationBridge = {};

export function registerNotificationBridge(value: NotificationBridge) {
    bridge.success = value.success;
    bridge.error = value.error;
    bridge.info = value.info;
}

export function notifySuccess(message: string) {
    bridge.success?.(message);
}

export function notifyError(message: string) {
    bridge.error?.(message);
}

export function notifyInfo(message: string) {
    bridge.info?.(message);
}