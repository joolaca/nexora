import {
    ExecutionContext,
    HttpStatus,
    Injectable,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { AppException } from "../common/errors/app-exception";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
    canActivate(context: ExecutionContext) {
        return super.canActivate(context);
    }

    handleRequest(err: any, user: any) {
        if (err || !user) {
            throw new AppException(
                HttpStatus.UNAUTHORIZED,
                "AUTH_UNAUTHORIZED",
                {
                    kind: "auth",
                    domain: "auth",
                },
            );
        }

        return user;
    }
}
