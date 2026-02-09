// src/components/SidePanel.tsx
import { ReactNode, useEffect } from "react";

type Props = {
    open: boolean;
    title?: string;
    onClose: () => void;
    children: ReactNode;
    widthPx?: number;
};

export function SidePanel({ open, title, onClose, children, widthPx = 420 }: Props) {
    useEffect(() => {
        if (!open) return;

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };

        document.addEventListener("keydown", onKeyDown);

        // simple scroll lock
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", onKeyDown);
            document.body.style.overflow = prevOverflow;
        };
    }, [open, onClose]);

    if (!open) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
                style={{
                    position: "fixed",
                    inset: 0,
                    background: "rgba(0,0,0,0.35)",
                    zIndex: 1040,
                }}
            />

            {/* Panel */}
            <div
                style={{
                    position: "fixed",
                    top: 0,
                    right: 0,
                    height: "100vh",
                    width: widthPx,
                    background: "white",
                    zIndex: 1050,
                    boxShadow: "0 0 24px rgba(0,0,0,0.2)",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                <div className="d-flex align-items-center justify-content-between border-bottom p-3">
                    <div className="fw-semibold">{title ?? ""}</div>
                    <button className="btn btn-sm btn-outline-secondary" onClick={onClose}>
                        ✕
                    </button>
                </div>

                <div className="p-3" style={{ overflow: "auto" }}>
                    {children}
                </div>
            </div>
        </>
    );
}
