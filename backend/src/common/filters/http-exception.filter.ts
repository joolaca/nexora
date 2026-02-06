// backend/src/common/filters/http-exception.filter.ts
import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
} from "@nestjs/common";

function isProductionEnv() {
    return process.env.NODE_ENV === "production";
}

function extractThrownAt(stack?: string): string | null {
    if (!stack) return null;

    const lines = stack.split("\n").map((l) => l.trim());
    const frameLines = lines.filter((l) => l.startsWith("at "));

    const preferred =
        frameLines.find((l) => l.includes("/src/")) ||
        frameLines.find((l) => l.includes("\\src\\")) ||
        frameLines.find((l) => !l.includes("node_modules")) ||
        frameLines[0];

    return preferred ?? null;
}

@Catch()
export class GlobalHttpExceptionFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const res = ctx.getResponse();
        const req = ctx.getRequest();

        const isHttp = exception instanceof HttpException;

        const status = isHttp
            ? exception.getStatus()
            : HttpStatus.INTERNAL_SERVER_ERROR;

        const responseBody = isHttp ? exception.getResponse() : null;

        let message: any = exception?.message ?? "Internal error";
        let code: string | undefined;
        let params: Record<string, any> | undefined;

        if (typeof responseBody === "string") {
            message = responseBody;
        } else if (responseBody && typeof responseBody === "object") {
            const rb = responseBody as Record<string, any>;

            message = rb.message ?? message;

            code = rb.code;
            params = rb.params;
        }

        const showDebug = !isProductionEnv();
        const thrownAt = showDebug ? extractThrownAt(exception?.stack) : null;

        const error = {
            statusCode: status,
            code,
            params,
            message,

            path: req?.url,
            method: req?.method,

            name: showDebug ? exception?.name : undefined,
            thrownAt: showDebug ? thrownAt : undefined,
            stack: showDebug ? exception?.stack : undefined,
        };

        res.status(status).json({
            data: null,
            error,
            meta: { timestamp: new Date().toISOString() },
        });
    }
}
