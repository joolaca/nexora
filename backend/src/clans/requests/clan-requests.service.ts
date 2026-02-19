//backend/src/clans/requests/clan-requests.service.ts
import { Injectable } from "@nestjs/common";
import { ClanPermissions } from "../roles/clan-roles.permissions";
import { AppException } from "../../common/errors/app-exception";
import { ClanRequestRepository } from "./clan-requests.repository";
import { UsersRepository } from "../../users/users.repository";
import { ClansRepository } from "../clans.repository";
import {ClanInviteFlowRepository} from "./clan-invite-flow.repository"

@Injectable()
export class ClanRequestService {
    constructor(
        private readonly reqRepo: ClanRequestRepository,
        private readonly usersRepo: UsersRepository,
        private readonly clansRepo: ClansRepository,
        private readonly inviteFlowRepo: ClanInviteFlowRepository,
    ) {}

    //TODO ezeket átszervezni a overview ba más is fogja használni
    private getMemberRoleKey(clan: any, userId: string): string | null {
        const m = clan.members.find((x: any) => String(x.userId) === String(userId));
        return m?.roleKey ?? null;
    }

    //TODO ezeket átszervezni a overview ba más is fogja használni
    private hasPermission(clan: any, userId: string, perm: string): boolean {
        const roleKey = this.getMemberRoleKey(clan, userId);
        if (!roleKey) return false;

        const role = clan.roles.find((r : any) => r.key === roleKey);
        if (!role) return false;

        return role.permissions.includes(perm);
    }
    async inviteToClan(params: { actorUserId: string; targetUserId: string }) {
        const actorUser = await this.usersRepo.findById(params.actorUserId);
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

        if (!this.hasPermission(clan, params.actorUserId, ClanPermissions.RequestsManage)) {
            throw new AppException(403, "NO_PERMISSION", "No permission");
        }

        return this.inviteFlowRepo.inviteToClanTx({
            actorUserId: params.actorUserId,
            clanId,
            targetUserId: params.targetUserId,
        });
    }




    async listMyRequests(userId: string) {
        return this.reqRepo.listForUser(userId);
    }


    async getInviteRequestsList(params: { actorUserId: string }) {
        const actor = await this.usersRepo.findById(params.actorUserId);
        if (!actor) {
            throw new AppException(404, "USER_NOT_FOUND", "User not found");
        }

        if (!actor.clanId) {
            throw new AppException(
                409,
                "USER_NOT_IN_CLAN",
                "User is not in a clan"
            );
        }

        const clan = await this.clansRepo.findById(String(actor.clanId));
        if (!clan) {
            throw new AppException(404, "CLAN_NOT_FOUND", "Clan not found");
        }

        if (!this.hasPermission(clan, params.actorUserId, ClanPermissions.RequestsManage)) {
            throw new AppException( 403, "NO_PERMISSION", "No permission to view invites" );
        }

        return this.reqRepo.listPendingInvitesForClan(String(actor.clanId));
    }

}
