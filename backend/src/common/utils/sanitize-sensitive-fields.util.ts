const MASK = "***";

const SENSITIVE_KEYS = new Set([
    "password",
    "currentPassword",
    "newPassword",
    "token",
    "accessToken",
    "refreshToken",
    "authorization",
]);

function isPlainObject(value: unknown): value is Record<string, any> {
    return !!value && typeof value === "object" && !Array.isArray(value);
}

export function sanitizeSensitiveFields<T = any>(value: T): T {
    if (Array.isArray(value)) {
        return value.map((item) => sanitizeSensitiveFields(item)) as T;
    }

    if (!isPlainObject(value)) {
        return value;
    }

    const cloned: Record<string, any> = {};

    for (const [key, nestedValue] of Object.entries(value)) {
        if (SENSITIVE_KEYS.has(key)) {
            cloned[key] = MASK;
            continue;
        }

        cloned[key] = sanitizeSensitiveFields(nestedValue);
    }

    return cloned as T;
}
