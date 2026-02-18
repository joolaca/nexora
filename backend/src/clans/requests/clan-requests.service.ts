import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Clan, ClanDocument } from "../core/clans.schema";
import { User, UserDocument } from "../../users/user.schema";
import { ClanPermissions } from "../roles/clan-roles.permissions";
import { AppException } from "../../common/errors/app-exception";
import { ClanRequestRepository } from "./clan-requests.repository";
import { UsersRepository } from "../../users/users.repository";
import { ClansRepository } from "../overview/clan-overview.repository";

@Injectable()
export class ClanRequestService {
    constructor(
        @InjectModel(Clan.name) private readonly clanModel: Model<ClanDocument>,
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
        private readonly reqRepo: ClanRequestRepository,
        private readonly usersRepo: UsersRepository,
        private readonly clansOverviewRepo: ClansRepository,
    ) {}

    private getMemberRoleKey(clan: ClanDocument, userId: string): string | null {
        const m = clan.members.find((x) => String(x.userId) === String(userId));
        return m?.roleKey ?? null;
    }

    private hasPermission(clan: ClanDocument, userId: string, perm: string): boolean {
        const roleKey = this.getMemberRoleKey(clan, userId);
        if (!roleKey) return false;

        const role = clan.roles.find((r) => r.key === roleKey);
        if (!role) return false;

        return role.permissions.includes(perm);
    }

    private async joinClanTx(params: { clanId: string; userId: string; session: any }) {
        const clanIdObj = new Types.ObjectId(params.clanId);
        const userIdObj = new Types.ObjectId(params.userId);

        const user = await this.userModel.findById(userIdObj).session(params.session).exec();
        if (!user) throw new AppException(404, "USER_NOT_FOUND", "User not found");
        if (user.clanId) throw new AppException(409, "USER_ALREADY_IN_CLAN", "User already in a clan");

        const clan = await this.clanModel.findById(clanIdObj).session(params.session).exec();
        if (!clan) throw new AppException(404, "CLAN_NOT_FOUND", "Clan not found");

        const alreadyMember = clan.members.some((m) => String(m.userId) === String(userIdObj));
        if (alreadyMember) {
            user.clanId = clanIdObj;
            await user.save({ session: params.session });
            return;
        }

        clan.members.push({
            userId: userIdObj,
            roleKey: "member",
            joinedAt: new Date(),
        } as any);

        user.clanId = clanIdObj;

        await clan.save({ session: params.session });
        await user.save({ session: params.session });
    }

    // USER -> CLAN
    async applyToClan(params: { actorUserId: string; clanId: string }) {
        const { actorUserId, clanId } = params;

        const session = await this.clanModel.db.startSession();
        try {
            let out: any = null;

            await session.withTransaction(async () => {
                const clan = await this.clanModel.findById(clanId).session(session).exec();
                if (!clan) throw new AppException(404, "CLAN_NOT_FOUND", "Clan not found");

                const user = await this.userModel.findById(actorUserId).session(session).exec();
                if (!user) throw new AppException(404, "USER_NOT_FOUND", "User not found");
                if (user.clanId) throw new AppException(409, "USER_ALREADY_IN_CLAN", "User already in a clan");

                const existing = await this.reqRepo.findPending(clanId, actorUserId);
                if (existing) {
                    if (existing.type === "APPLY") {
                        out = { requestId: String(existing._id), status: "PENDING", autoAccepted: false };
                        return;
                    }

                    await this.reqRepo.updateStatus({
                        id: new Types.ObjectId(String(existing._id)),
                        status: "ACCEPTED",
                        decidedByUserId: actorUserId,
                        session,
                    });

                    await this.joinClanTx({ clanId, userId: actorUserId, session });

                    out = { requestId: String(existing._id), status: "ACCEPTED", autoAccepted: true };
                    return;
                }

                const created = await this.reqRepo.createPending({
                    clanId,
                    userId: actorUserId,
                    type: "APPLY",
                    createdByUserId: actorUserId,
                    session,
                });

                out = { requestId: String(created._id), status: "PENDING", autoAccepted: false };
            });

            return out;
        } finally {
            await session.endSession();
        }
    }

    // CLAN -> USER
    async inviteToClan(params: { actorUserId: string; clanId: string; targetUserId: string }) {
        const { actorUserId, clanId, targetUserId } = params;

        const session = await this.clanModel.db.startSession();
        try {
            let out: any = null;

            await session.withTransaction(async () => {
                const clan = await this.clanModel.findById(clanId).session(session).exec();
                if (!clan) throw new AppException(404, "CLAN_NOT_FOUND", "Clan not found");

                if (!this.hasPermission(clan, actorUserId, ClanPermissions.Edit)) {
                    throw new AppException(403, "NO_PERMISSION", "No permission");
                }

                const target = await this.userModel.findById(targetUserId).session(session).exec();
                if (!target) throw new AppException(404, "USER_NOT_FOUND", "User not found");
                if (target.clanId) throw new AppException(409, "USER_ALREADY_IN_CLAN", "User already in a clan");

                const existing = await this.reqRepo.findPending(clanId, targetUserId);
                if (existing) {
                    if (existing.type === "INVITE") {
                        out = { requestId: String(existing._id), status: "PENDING", autoAccepted: false };
                        return;
                    }

                    await this.reqRepo.updateStatus({
                        id: new Types.ObjectId(String(existing._id)),
                        status: "ACCEPTED",
                        decidedByUserId: actorUserId,
                        session,
                    });

                    await this.joinClanTx({ clanId, userId: targetUserId, session });

                    out = { requestId: String(existing._id), status: "ACCEPTED", autoAccepted: true };
                    return;
                }

                const created = await this.reqRepo.createPending({
                    clanId,
                    userId: targetUserId,
                    type: "INVITE",
                    createdByUserId: actorUserId,
                    session,
                });

                out = { requestId: String(created._id), status: "PENDING", autoAccepted: false };
            });

            return out;
        } finally {
            await session.endSession();
        }
    }

    async listMyRequests(userId: string) {
        return this.reqRepo.listForUser(userId);
    }

    async listClanPendingRequests(params: { actorUserId: string; clanId: string }) {
        const clan = await this.clanModel.findById(params.clanId).exec();
        if (!clan) throw new AppException(404, "CLAN_NOT_FOUND", "Clan not found");

        if (!this.hasPermission(clan, params.actorUserId, ClanPermissions.Edit)) {
            throw new AppException(403, "NO_PERMISSION", "No permission");
        }

        return this.reqRepo.listPendingForClan(params.clanId);
    }

    async acceptRequest(params: { actorUserId: string; requestId: string }) {
        const req = await this.reqRepo.findById(params.requestId);
        if (!req) throw new AppException(404, "REQUEST_NOT_FOUND", "Request not found");
        if (req.status !== "PENDING") throw new AppException(409, "REQUEST_NOT_PENDING", "Request is not pending");

        const session = await this.clanModel.db.startSession();
        try {
            await session.withTransaction(async () => {
                if (req.type === "INVITE") {
                    if (String(req.userId) !== String(params.actorUserId)) {
                        throw new AppException(403, "NOT_OWNER_OF_REQUEST", "Not allowed");
                    }

                    await this.reqRepo.updateStatus({
                        id: new Types.ObjectId(String(req._id)),
                        status: "ACCEPTED",
                        decidedByUserId: params.actorUserId,
                        session,
                    });

                    await this.joinClanTx({ clanId: String(req.clanId), userId: String(req.userId), session });
                    return;
                }

                const clan = await this.clanModel.findById(req.clanId).session(session).exec();
                if (!clan) throw new AppException(404, "CLAN_NOT_FOUND", "Clan not found");

                if (!this.hasPermission(clan, params.actorUserId, ClanPermissions.Edit)) {
                    throw new AppException(403, "NO_PERMISSION", "No permission");
                }

                await this.reqRepo.updateStatus({
                    id: new Types.ObjectId(String(req._id)),
                    status: "ACCEPTED",
                    decidedByUserId: params.actorUserId,
                    session,
                });

                await this.joinClanTx({ clanId: String(req.clanId), userId: String(req.userId), session });
            });

            return { ok: true };
        } finally {
            await session.endSession();
        }
    }

    async rejectRequest(params: { actorUserId: string; requestId: string }) {
        const req = await this.reqRepo.findById(params.requestId);
        if (!req) throw new AppException(404, "REQUEST_NOT_FOUND", "Request not found");
        if (req.status !== "PENDING") throw new AppException(409, "REQUEST_NOT_PENDING", "Request is not pending");

        if (req.type === "INVITE") {
            if (String(req.userId) !== String(params.actorUserId)) {
                throw new AppException(403, "NOT_OWNER_OF_REQUEST", "Not allowed");
            }

            await this.reqRepo.updateStatus({
                id: new Types.ObjectId(String(req._id)),
                status: "REJECTED",
                decidedByUserId: params.actorUserId,
            });

            return { ok: true };
        }

        const clan = await this.clanModel.findById(req.clanId).exec();
        if (!clan) throw new AppException(404, "CLAN_NOT_FOUND", "Clan not found");

        if (!this.hasPermission(clan, params.actorUserId, ClanPermissions.Edit)) {
            throw new AppException(403, "NO_PERMISSION", "No permission");
        }

        await this.reqRepo.updateStatus({
            id: new Types.ObjectId(String(req._id)),
            status: "REJECTED",
            decidedByUserId: params.actorUserId,
        });

        return { ok: true };
    }

    async cancelRequest(params: { actorUserId: string; requestId: string }) {
        const req = await this.reqRepo.findById(params.requestId);
        if (!req) throw new AppException(404, "REQUEST_NOT_FOUND", "Request not found");
        if (req.status !== "PENDING") throw new AppException(409, "REQUEST_NOT_PENDING", "Request is not pending");

        if (String(req.createdByUserId) !== String(params.actorUserId)) {
            throw new AppException(403, "NOT_OWNER_OF_REQUEST", "Not allowed");
        }

        await this.reqRepo.updateStatus({
            id: new Types.ObjectId(String(req._id)),
            status: "CANCELLED",
            decidedByUserId: params.actorUserId,
        });

        return { ok: true };
    }

    async getInviteRequestsList(params: { actorUserId: string }) {
        // 1️⃣ Actor user betöltése
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

        // 2️⃣ Clan betöltése
        const clan = await this.clansOverviewRepo.findById(String(actor.clanId));
        if (!clan) {
            throw new AppException(404, "CLAN_NOT_FOUND", "Clan not found");
        }

        // 3️⃣ Permission check
        if (!this.hasPermission(clan, params.actorUserId, ClanPermissions.Edit)) {
            throw new AppException( 403, "NO_PERMISSION", "No permission to view invites" );
        }

        // 4️⃣ Invite requestek lekérése
        return this.reqRepo.listPendingInvitesForClan(String(actor.clanId));
    }

}
