// backend/src/common/filters/http-exception.filter.ts
import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
} from "@nestjs/common";

function isProductionEnv() {
    // Nestben tipikusan NODE_ENV=production a prod jel
    return process.env.NODE_ENV === "production";
}

/**
 * Megpróbálja kinyerni a stackből az első "hasznos" sort:
 * - preferáljuk a saját src/ fájlokat
 * - ha nincs, akkor az első stack sor
 */
function extractThrownAt(stack?: string): string | null {
    if (!stack) return null;

    const lines = stack.split("\n").map((l) => l.trim());
    // általában:
    // 0: Error: message
    // 1: at Something (path:line:col)
    const frameLines = lines.filter((l) => l.startsWith("at "));

    // Preferáljuk a projektbeli (src/) frame-et, ne node_modules-t
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

        // HttpException esetén van getResponse()
        const responseBody = isHttp ? exception.getResponse() : null;

        // Alap üzenet (ha semmi nincs)
        let message: any = exception?.message ?? "Internal error";

        // HttpException.getResponse() lehet string | object
        if (typeof responseBody === "string") {
            message = responseBody;
        } else if (responseBody && typeof responseBody === "object") {
            const rb = responseBody as Record<string, any>;
            // Nest default: { statusCode, message, error }
            message = rb.message ?? message;
        }

        const showDebug = !isProductionEnv();

        const thrownAt = showDebug ? extractThrownAt(exception?.stack) : null;

        const error = {
            statusCode: status,
            // message lehet string vagy string[]
            message,
            path: req?.url,
            method: req?.method,

            // extra, hasznos meta
            name: showDebug ? exception?.name : undefined,

            // “hol dobta”: első releváns stack sor
            thrownAt: showDebug ? thrownAt : undefined,

            // stack csak nem prod esetén
            stack: showDebug ? exception?.stack : undefined,
        };

        res.status(status).json({
            data: null,
            error,
            meta: { timestamp: new Date().toISOString() },
        });
    }
}
