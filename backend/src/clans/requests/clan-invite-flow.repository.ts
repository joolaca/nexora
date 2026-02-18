import { Injectable } from "@nestjs/common";
import { InjectConnection } from "@nestjs/mongoose";
import { Connection, Types } from "mongoose";
import { ClanRequestRepository } from "./clan-requests.repository";
import { UsersRepository } from "../../users/users.repository";
import { ClansRepository } from "../overview/clan-overview.repository";
import { AppException } from "../../common/errors/app-exception";

@Injectable()
export class ClanInviteFlowRepository {
    constructor(
        @InjectConnection() private readonly connection: Connection,
        private readonly reqRepo: ClanRequestRepository,
        private readonly usersRepo: UsersRepository,
        private readonly clansRepo: ClansRepository,
    ) {}

    async inviteToClanTx(params: {
        actorUserId: string;
        clanId: string;
        targetUserId: string;
    }) {
        const session = await this.connection.startSession();

        try {
            let out: any = null;

            await session.withTransaction(async () => {
                const clan = await this.clansRepo.findById(params.clanId, session);
                if (!clan) {
                    throw new AppException(404, "CLAN_NOT_FOUND", "Clan not found");
                }

                const target = await this.usersRepo.findById(params.targetUserId, session);
                if (!target) {
                    throw new AppException(404, "USER_NOT_FOUND", "User not found");
                }

                if (target.clanId) {
                    throw new AppException(409, "USER_ALREADY_IN_CLAN", "User already in a clan");
                }

                const existing = await this.reqRepo.findPending(
                    params.clanId,
                    params.targetUserId,
                );

                if (existing) {
                    if (existing.type === "INVITE") {
                        out = {
                            requestId: String(existing._id),
                            status: "PENDING",
                            autoAccepted: false,
                        };
                        return;
                    }

                    await this.reqRepo.updateStatus({
                        id: new Types.ObjectId(String(existing._id)),
                        status: "ACCEPTED",
                        decidedByUserId: params.actorUserId,
                        session,
                    });

                    out = {
                        requestId: String(existing._id),
                        status: "ACCEPTED",
                        autoAccepted: true,
                    };
                    return;
                }

                const created = await this.reqRepo.createPending({
                    clanId: params.clanId,
                    userId: params.targetUserId,
                    type: "INVITE",
                    createdByUserId: params.actorUserId,
                    session,
                });

                out = {
                    requestId: String(created._id),
                    status: "PENDING",
                    autoAccepted: false,
                };
            });

            return out;
        } finally {
            await session.endSession();
        }
    }
}
