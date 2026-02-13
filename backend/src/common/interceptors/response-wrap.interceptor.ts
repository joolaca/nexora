//backend/src/common/interceptors/response-wrap.interceptor.ts
import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

@Injectable()
export class ResponseWrapInterceptor implements NestInterceptor {
    intercept(_context: ExecutionContext, next: CallHandler): Observable<any> {

        const req = _context.switchToHttp().getRequest<Request & { url?: string }>();
        const url = req?.url ?? "";

        // ✅ Swagger / OpenAPI: ne nyúljunk hozzá
        if (url.startsWith("/api") || url.startsWith("/api-json")) {
            return next.handle();
        }

        return next.handle().pipe(
            map((data) => ({
                data,
                meta: { timestamp: new Date().toISOString() },
            })),
        );
    }
}
