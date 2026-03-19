// backend/src/common/errors/app-exception.ts
import { HttpException, HttpStatus } from "@nestjs/common";

export type ErrorCode = string;

export type ErrorSeverity = "info" | "warn" | "error" | "critical";
export type ErrorKind = "business" | "validation" | "auth" | "permission" | "system" | "external";

export type AppExceptionMeta = {
    severity: ErrorSeverity;
    kind: ErrorKind;
    domain: string | null;

    shouldLog: boolean;
    shouldPersist: boolean;

    params: Record<string, any>;
    context: Record<string, any>;
};

export type AppExceptionOptions = {
    message?: string;
    params?: Record<string, any>;
    context?: Record<string, any>;

    severity?: ErrorSeverity;
    kind?: ErrorKind;
    domain?: string | null;

    shouldLog?: boolean;
    shouldPersist?: boolean;
};

function defaultMessageFromCode(code: ErrorCode): string {
    return code
        .toLowerCase()
        .split("_")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
}

export class AppException extends HttpException {
    readonly code: ErrorCode;
    readonly meta: AppExceptionMeta;

    constructor(
        status: HttpStatus,
        code: ErrorCode,
        options?: AppExceptionOptions,
    ) {
        const resolvedMessage = options?.message ?? defaultMessageFromCode(code);

        const meta: AppExceptionMeta = {
            severity: options?.severity ?? (status >= 500 ? "error" : "warn"),
            kind: options?.kind ?? (status >= 500 ? "system" : "business"),
            domain: options?.domain ?? null,

            shouldLog: options?.shouldLog ?? status >= 500,
            shouldPersist: options?.shouldPersist ?? false,

            params: options?.params ?? {},
            context: options?.context ?? {},
        };

        super(
            {
                code,
                message: resolvedMessage,
                params: meta.params,
                context: meta.context,
                severity: meta.severity,
                kind: meta.kind,
                domain: meta.domain,
            },
            status,
        );

        this.code = code;
        this.meta = meta;
    }
}