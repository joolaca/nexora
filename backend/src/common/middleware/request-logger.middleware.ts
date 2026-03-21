//backend/src/common/middleware/request-logger.middleware.ts
import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { sanitizeSensitiveFields } from "../utils/sanitize-sensitive-fields.util";

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
    use(req: Request, _res: Response, next: NextFunction) {
        console.log("➡️ INCOMING REQUEST", {
            method: req.method,
            url: req.originalUrl,
            headers: sanitizeSensitiveFields({
                authorization: req.headers["authorization"] ?? null,
            }),
            body: sanitizeSensitiveFields(req.body),
        });

        next();
    }
}
