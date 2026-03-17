import { Injectable } from "@nestjs/common";
import { ClanRequestRepository } from "./clan-requests.repository";
import { ClanInviteFlowRepository } from "./clan-invite-flow.repository";

@Injectable()
export class ClanRequestService {
    constructor(
        private readonly reqRepo: ClanRequestRepository,
        private readonly inviteFlowRepo: ClanInviteFlowRepository,
    ) {}

    async inviteToClan(params: {
        actorUserId: string;
        clanId: string;
        targetUserId: string;
    }) {
        return this.inviteFlowRepo.inviteToClanTx({
            actorUserId: params.actorUserId,
            clanId: params.clanId,
            targetUserId: params.targetUserId,
        });
    }

    async listMyRequests(userId: string) {
        return this.reqRepo.listForUser(userId);
    }

    async getInviteRequestsList(params: { clanId: string }) {
        return this.reqRepo.listPendingInvitesForClan(params.clanId);
    }
}