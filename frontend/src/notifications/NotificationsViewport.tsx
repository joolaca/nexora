// src/notifications/NotificationsViewport.tsx
import type { NotificationItem } from "./NotificationsProvider";

type Props = {
    items: NotificationItem[];
    onClose: (id: string) => void;
};

function getAlertClass(type: NotificationItem["type"]) {
    if (type === "success") return "alert alert-success";
    if (type === "error") return "alert alert-danger";
    return "alert alert-info";
}

export function NotificationsViewport({ items, onClose }: Props) {
    return (
        <div
            style={{
                position: "fixed",
                top: 16,
                right: 16,
                zIndex: 2000,
                width: 360,
                maxWidth: "calc(100vw - 32px)",
            }}
        >
            <div className="d-flex flex-column gap-2">
                {items.map((item) => (
                    <div key={item.id} className={`${getAlertClass(item.type)} shadow-sm mb-0`}>
                        <div className="d-flex justify-content-between align-items-start gap-3">
                            <div>{item.message}</div>

                            <button
                                type="button"
                                className="btn-close"
                                aria-label="Close"
                                onClick={() => onClose(item.id)}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}