// backend/src/clans/guards/clan-permission.guard.ts
import {
    CanActivate,
    ExecutionContext,
    Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Request } from "express";
import { UsersRepository } from "../../users/users.repository";
import { ClansRepository } from "../core/clans.repository";
import { AppException } from "../../common/errors/app-exception";
import { CLAN_PERMISSION_KEY } from "./require-clan-permission.decorator";
import { ClanPermission } from "../roles/clan-roles.permissions";

type AuthenticatedRequest = Request & {
    user?: {
        userId: string;
    };
    clanAuth?: {
        actorUserId: string;
        clanId: string;
        roleKey: string;
        permissions: string[];
    };
};

@Injectable()
export class ClanPermissionGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly usersRepo: UsersRepository,
        private readonly clansRepo: ClansRepository,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredPermission =
            this.reflector.getAllAndOverride<ClanPermission>(
                CLAN_PERMISSION_KEY,
                [context.getHandler(), context.getClass()],
            );

        if (!requiredPermission) {
            throw new AppException(
                500,
                "CLAN_PERMISSION_NOT_DEFINED",
                "Missing @RequireClanPermission on route",
            );
        }


        const req = context.switchToHttp().getRequest<AuthenticatedRequest>();
        const actorUserId = req.user?.userId;

        if (!actorUserId) {
            throw new AppException(401, "UNAUTHORIZED", "Unauthorized");
        }

        const actorUser = await this.usersRepo.findById(actorUserId);
        if (!actorUser) {
            throw new AppException(404, "USER_NOT_FOUND", "User not found");
        }

        if (!actorUser.clanId) {
            throw new AppException(409, "USER_NOT_IN_CLAN", "User is not in a clan");
        }

        const clanId = String(actorUser.clanId);

        const clan = await this.clansRepo.findById(clanId);
        if (!clan) {
            throw new AppException(404, "CLAN_NOT_FOUND", "Clan not found");
        }

        const member = clan.members.find(
            (m: any) => String(m.userId) === String(actorUserId),
        );

        if (!member) {
            throw new AppException(403, "NOT_CLAN_MEMBER", "User is not a clan member");
        }

        const role = clan.roles.find((r: any) => r.key === member.roleKey);
        if (!role) {
            throw new AppException(403, "ROLE_NOT_FOUND", "Clan role not found");
        }

        if (!role.permissions.includes(requiredPermission)) {
            throw new AppException(403, "NO_PERMISSION", "No permission");
        }

        req.clanAuth = {
            actorUserId,
            clanId,
            roleKey: member.roleKey,
            permissions: role.permissions,
        };

        return true;
    }
}