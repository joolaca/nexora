import { Injectable } from "@nestjs/common";
import { ClanRequestRepository } from "./clan-requests.repository";
import { ClanInviteFlowRepository } from "./clan-invite-flow.repository";
import { AppException } from "../../common/errors/app-exception";

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


    async cancelInvite(params: {
        actorUserId: string;
        clanId: string;
        requestId: string;
    }) {
        const request = await this.reqRepo.findById(params.requestId);

        if (!request) {
            throw new AppException( 404, "CLAN_PERMISSION_NOT_DEFINED");
        }

        if (String(request.clanId) !== params.clanId) {
            throw new AppException( 403, "CLAN_REQUEST_FORBIDDEN");
        }

        if (request.type !== "INVITE") {
            throw new AppException( 400, "CLAN_REQUEST_FORBIDDEN");
        }

        if (request.status !== "PENDING") {
            throw new AppException( 400, "CLAN_REQUEST_NOT_PENDING");
        }

        await this.reqRepo.updateStatus({
            id: request._id,
            status: "CANCELLED",
            decidedByUserId: params.actorUserId,
        });

        return {
            requestId: String(request._id),
            status: "CANCELLED",
        };
    }

}