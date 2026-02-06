// backend/src/common/errors/app-exception.ts
import { HttpException, HttpStatus } from "@nestjs/common";

export type ErrorCode = string;

export class AppException extends HttpException {
    constructor(
        status: HttpStatus,
        code: ErrorCode,
        message: string,
        params?: Record<string, any>
    ) {
        super({ code, message, params }, status);
    }
}
