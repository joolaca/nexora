//frontend/src/api/idempotency.ts
export function createIdempotencyKey(prefix = "req"): string {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return `${prefix}:${crypto.randomUUID()}`;
    }

    return `${prefix}:${Math.random().toString(36).slice(2)}-${Date.now()}`;
}