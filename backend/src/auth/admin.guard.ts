import {
    CanActivate,
    ExecutionContext,
    HttpStatus,
    Injectable,
} from "@nestjs/common";
import { Request } from "express";
import { UsersRepository } from "../users/users.repository";
import { UserRole } from "../users/user-role.enum";
import { AppException } from "../common/errors/app-exception";

type AuthenticatedRequest = Request & {
    user?: {
        userId?: string;
    };
};

@Injectable()
export class AdminGuard implements CanActivate {
    constructor(
        private readonly usersRepository: UsersRepository,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
        const userId = request.user?.userId;

        if (!userId) {
            throw new AppException(
                HttpStatus.UNAUTHORIZED,
                "AUTH_UNAUTHORIZED",
                {
                    message: "Authentication required",
                    kind: "auth",
                    domain: "auth",
                    severity: "warn",
                },
            );
        }

        const user = await this.usersRepository.findById(userId);

        if (!user) {
            throw new AppException(
                HttpStatus.UNAUTHORIZED,
                "AUTH_USER_NOT_FOUND",
                {
                    message: "Authenticated user was not found",
                    kind: "auth",
                    domain: "auth",
                    severity: "warn",
                    shouldLog: true,
                },
            );
        }

        if (user.role !== UserRole.ADMIN) {
            throw new AppException(
                HttpStatus.FORBIDDEN,
                "ADMIN_ROLE_REQUIRED",
                {
                    message: "Admin role required",
                    kind: "permission",
                    domain: "auth",
                    severity: "warn",
                    shouldLog: true,
                },
            );
        }

        return true;
    }
}