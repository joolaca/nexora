// backend/src/common/errors/error-reporting.service.ts
import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { HttpException, HttpStatus } from "@nestjs/common";
import { AppException } from "./app-exception";
import { ErrorLog, ErrorLogDocument } from "./error-log.schema";
import { sanitizeSensitiveFields } from "../utils/sanitize-sensitive-fields.util";

export type ErrorReportContext = {
    path?: string;
    method?: string;
    actorUserId?: string | null;
    stack?: string | null;
    requestBody?: Record<string, any> | null;
};

type ExtractedErrorMeta = {
    severity: string | null;
    kind: string | null;
    domain: string | null;
    params: Record<string, any>;
    context: Record<string, any>;
    shouldPersist: boolean;
};

@Injectable()
export class ErrorReportingService {
    private readonly logger = new Logger(ErrorReportingService.name);

    constructor(
        @InjectModel(ErrorLog.name)
        private readonly errorLogModel: Model<ErrorLogDocument>,
    ) {}

    shouldLog(exception: unknown): boolean {
        if (exception instanceof AppException) {
            return exception.meta.shouldLog;
        }

        if (exception instanceof HttpException) {
            return exception.getStatus() >= 500;
        }

        return true;
    }

    shouldPersist(exception: unknown): boolean {
        if (exception instanceof AppException) {
            return exception.meta.shouldPersist;
        }

        if (exception instanceof HttpException) {
            return exception.getStatus() >= 500;
        }

        return true;
    }

    getStatusCode(exception: unknown): number {
        if (exception instanceof HttpException) {
            return exception.getStatus();
        }

        return HttpStatus.INTERNAL_SERVER_ERROR;
    }

    getErrorCode(exception: unknown): string | null {
        if (exception instanceof AppException) {
            return exception.errorCode ?? null;
        }

        if (exception instanceof HttpException) {
            const response = exception.getResponse();

            if (response && typeof response === "object" && "errorCode" in response) {
                return String((response as any).errorCode ?? null);
            }
        }

        return null;
    }

    getMessage(exception: unknown): string {
        if (exception instanceof AppException) {
            const response = exception.getResponse();

            if (response && typeof response === "object" && "message" in response) {
                return String((response as any).message ?? "Application error");
            }

            return exception.message ?? "Application error";
        }

        if (exception instanceof HttpException) {
            const response = exception.getResponse();

            if (typeof response === "string") {
                return response;
            }

            if (response && typeof response === "object" && "message" in response) {
                const message = (response as any).message;

                if (Array.isArray(message)) {
                    return message.join(", ");
                }

                return String(message);
            }

            return exception.message ?? "Http error";
        }

        if (exception instanceof Error) {
            return exception.message || "Internal error";
        }

        return "Internal error";
    }

    getName(exception: unknown): string | null {
        if (exception instanceof Error) {
            return exception.name ?? null;
        }

        return null;
    }

    getMeta(exception: unknown): ExtractedErrorMeta {
        if (exception instanceof AppException) {
            return {
                severity: exception.meta.severity ?? null,
                kind: exception.meta.kind ?? null,
                domain: exception.meta.domain ?? null,
                params: exception.meta.params ?? {},
                context: exception.meta.context ?? {},
                shouldPersist: exception.meta.shouldPersist ?? false,
            };
        }

        return {
            severity: null,
            kind: null,
            domain: null,
            params: {},
            context: {},
            shouldPersist: false,
        };
    }

    async report(
        exception: unknown,
        reportContext: ErrorReportContext = {},
    ): Promise<void> {
        const shouldLog = this.shouldLog(exception);
        const shouldPersist = this.shouldPersist(exception);

        const statusCode = this.getStatusCode(exception);
        const errorCode = this.getErrorCode(exception);
        const message = this.getMessage(exception);
        const name = this.getName(exception);

        const meta = this.getMeta(exception);

        const actorUserId =
            reportContext.actorUserId ??
            (meta.context?.actorUserId ? String(meta.context.actorUserId) : null);

        const sanitizedRequestBody = reportContext.requestBody
            ? sanitizeSensitiveFields(reportContext.requestBody)
            : null;

        const payload = {
            statusCode,
            errorCode,
            message,
            name,
            severity: meta.severity,
            kind: meta.kind,
            domain: meta.domain,
            shouldPersist,
            path: reportContext.path ?? null,
            method: reportContext.method ?? null,
            actorUserId,
            params: meta.params ?? {},
            requestBody: sanitizedRequestBody,
            context: meta.context ?? {},
            stack: reportContext.stack ?? null,
            environment: process.env.NODE_ENV ?? null,
        };

        if (shouldLog) {
            if (statusCode >= 500) {
                this.logger.error(message, payload.stack ?? undefined, JSON.stringify(payload));
            } else {
                this.logger.warn(JSON.stringify(payload));
            }
        }

        if (!shouldPersist) {
            return;
        }

        try {
            await this.errorLogModel.create(payload);
        } catch (persistError) {
            this.logger.error(
                "Failed to persist error log",
                persistError instanceof Error ? persistError.stack : undefined,
            );
        }
    }
}
