import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
    use(req: Request, _res: Response, next: NextFunction) {
        console.log("➡️ INCOMING REQUEST", {
            method: req.method,
            url: req.originalUrl,
            headers: {
                authorization: req.headers["authorization"] ?? null,
            },
            body: req.body,
        });

        next();
    }
}
