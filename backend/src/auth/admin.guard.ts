import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
    UnauthorizedException,
} from "@nestjs/common";
import { Request } from "express";
import { UsersRepository } from "../users/users.repository";
import { UserRole } from "../users/user-role.enum";

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
            throw new UnauthorizedException("Unauthorized");
        }

        const user = await this.usersRepository.findById(userId);

        if (!user) {
            throw new UnauthorizedException("User not found");
        }

        if (user.role !== UserRole.ADMIN) {
            throw new ForbiddenException("Admin access required");
        }

        return true;
    }
}