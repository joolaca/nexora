import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
    Injectable,
} from "@nestjs/common";
import { ErrorReportingService } from "../errors/error-reporting.service";
import { sanitizeSensitiveFields } from "../utils/sanitize-sensitive-fields.util";

function isProductionEnv() {
    return process.env.NODE_ENV === "production";
}

@Injectable()
@Catch()
export class GlobalHttpExceptionFilter implements ExceptionFilter {
    constructor(
        private readonly errorReportingService: ErrorReportingService,
    ) {}

    async catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const res = ctx.getResponse();
        const req = ctx.getRequest();

        const isHttp = exception instanceof HttpException;

        const status = isHttp
            ? exception.getStatus()
            : HttpStatus.INTERNAL_SERVER_ERROR;

        const responseBody = isHttp ? exception.getResponse() : null;

        let message: any = exception?.message ?? "Internal error";
        let errorCode: string | undefined;
        let params: Record<string, any> | undefined;
        let context: Record<string, any> | undefined;
        let severity: string | undefined;
        let kind: string | undefined;
        let domain: string | null | undefined;

        if (typeof responseBody === "string") {
            message = responseBody;
        } else if (responseBody && typeof responseBody === "object") {
            const rb = responseBody as Record<string, any>;

            message = rb.message ?? message;
            errorCode = rb.errorCode;
            params = rb.params;
            context = rb.context;
            severity = rb.severity;
            kind = rb.kind;
            domain = rb.domain;
        }

        const showDebug = !isProductionEnv();
        const stack = showDebug ? exception?.stack : undefined;

        const actorUserId =
            req?.user?.userId ??
            context?.actorUserId ??
            null;

        const requestBody =
            req?.body && typeof req.body === "object"
                ? sanitizeSensitiveFields(req.body)
                : null;

        await this.errorReportingService.report(exception, {
            path: req?.url,
            method: req?.method,
            actorUserId,
            stack,
            requestBody,
        });

        const error = {
            statusCode: status,
            errorCode,
            params,
            requestBody: showDebug ? requestBody : undefined,
            context,
            message,
            severity,
            kind,
            domain,
            path: req?.url,
            method: req?.method,
            name: showDebug ? exception?.name : undefined,
            stack: showDebug ? exception?.stack : undefined,
        };

        res.status(status).json({
            data: null,
            error,
            meta: { timestamp: new Date().toISOString() },
        });
    }
}
