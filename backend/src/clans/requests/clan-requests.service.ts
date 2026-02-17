// backend/src/clans/join/clan-join.service.ts
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Clan, ClanDocument } from "../core/clans.schema";
import { User, UserDocument } from "../../users/user.schema";
import { ClanPermissions } from "../roles/clan-roles.permissions";
import { AppException } from "../../common/errors/app-exception";
import { ClanJoinRepository } from "./clan-requests.repository";
import { ClanRequestType } from "./clan-request.schema";

@Injectable()
export class ClanJoinService {
    constructor(
        @InjectModel(Clan.name) private readonly clanModel: Model<ClanDocument>,
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
        private readonly joinRepo: ClanJoinRepository
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

                // van már PENDING?
                const existing = await this.joinRepo.findPending(clanId, actorUserId);
                if (existing) {
                    // ha ugyanaz a type, akkor csak visszaadjuk (idempotens)
                    if (existing.type === "APPLY") {
                        out = { requestId: String(existing._id), status: "PENDING", autoAccepted: false };
                        return;
                    }
                    // ha ellentétes (INVITE), akkor auto-accept
                    await this.joinRepo.updateStatus({
                        id: new Types.ObjectId(String(existing._id)),
                        status: "ACCEPTED",
                        decidedByUserId: actorUserId,
                        session,
                    });

                    // beléptetés
                    await this.joinClanTx({ clanId, userId: actorUserId, session });

                    out = { requestId: String(existing._id), status: "ACCEPTED", autoAccepted: true };
                    return;
                }

                const created = await this.joinRepo.createPending({
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

    // CLAN -> USER (permission kell)
    async inviteToClan(params: { actorUserId: string; clanId: string; targetUserId: string }) {
        const { actorUserId, clanId, targetUserId } = params;

        const session = await this.clanModel.db.startSession();
        try {
            let out: any = null;

            await session.withTransaction(async () => {
                const clan = await this.clanModel.findById(clanId).session(session).exec();
                if (!clan) throw new AppException(404, "CLAN_NOT_FOUND", "Clan not found");

                // permission: itt most Edit-et kérünk (később csinálhatsz külön Invite perm-et)
                if (!this.hasPermission(clan, actorUserId, ClanPermissions.Edit)) {
                    throw new AppException(403, "NO_PERMISSION", "No permission");
                }

                const target = await this.userModel.findById(targetUserId).session(session).exec();
                if (!target) throw new AppException(404, "USER_NOT_FOUND", "User not found");
                if (target.clanId) throw new AppException(409, "USER_ALREADY_IN_CLAN", "User already in a clan");

                const existing = await this.joinRepo.findPending(clanId, targetUserId);
                if (existing) {
                    if (existing.type === "INVITE") {
                        out = { requestId: String(existing._id), status: "PENDING", autoAccepted: false };
                        return;
                    }

                    // existing APPLY -> auto-accept
                    await this.joinRepo.updateStatus({
                        id: new Types.ObjectId(String(existing._id)),
                        status: "ACCEPTED",
                        decidedByUserId: actorUserId,
                        session,
                    });

                    await this.joinClanTx({ clanId, userId: targetUserId, session });

                    out = { requestId: String(existing._id), status: "ACCEPTED", autoAccepted: true };
                    return;
                }

                const created = await this.joinRepo.createPending({
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
        return this.joinRepo.listForUser(userId);
    }

    async listClanPendingRequests(params: { actorUserId: string; clanId: string }) {
        const clan = await this.clanModel.findById(params.clanId).exec();
        if (!clan) throw new AppException(404, "CLAN_NOT_FOUND", "Clan not found");

        if (!this.hasPermission(clan, params.actorUserId, ClanPermissions.Edit)) {
            throw new AppException(403, "NO_PERMISSION", "No permission");
        }

        return this.joinRepo.listPendingForClan(params.clanId);
    }

    async acceptRequest(params: { actorUserId: string; requestId: string }) {
        const req = await this.joinRepo.findById(params.requestId);
        if (!req) throw new AppException(404, "REQUEST_NOT_FOUND", "Request not found");
        if (req.status !== "PENDING") throw new AppException(409, "REQUEST_NOT_PENDING", "Request is not pending");

        const session = await this.clanModel.db.startSession();
        try {
            await session.withTransaction(async () => {
                // INVITE-et a user fogadja el
                if (req.type === "INVITE") {
                    if (String(req.userId) !== String(params.actorUserId)) {
                        throw new AppException(403, "NOT_OWNER_OF_REQUEST", "Not allowed");
                    }
                    await this.joinRepo.updateStatus({
                        id: new Types.ObjectId(String(req._id)),
                        status: "ACCEPTED",
                        decidedByUserId: params.actorUserId,
                        session,
                    });
                    await this.joinClanTx({ clanId: String(req.clanId), userId: String(req.userId), session });
                    return;
                }

                // APPLY-t a clan fogadja el (permission)
                const clan = await this.clanModel.findById(req.clanId).session(session).exec();
                if (!clan) throw new AppException(404, "CLAN_NOT_FOUND", "Clan not found");

                if (!this.hasPermission(clan, params.actorUserId, ClanPermissions.Edit)) {
                    throw new AppException(403, "NO_PERMISSION", "No permission");
                }

                await this.joinRepo.updateStatus({
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
        const req = await this.joinRepo.findById(params.requestId);
        if (!req) throw new AppException(404, "REQUEST_NOT_FOUND", "Request not found");
        if (req.status !== "PENDING") throw new AppException(409, "REQUEST_NOT_PENDING", "Request is not pending");

        // INVITE-et a user tudja rejectelni; APPLY-t a clan admin/owner
        if (req.type === "INVITE") {
            if (String(req.userId) !== String(params.actorUserId)) {
                throw new AppException(403, "NOT_OWNER_OF_REQUEST", "Not allowed");
            }
            await this.joinRepo.updateStatus({
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

        await this.joinRepo.updateStatus({
            id: new Types.ObjectId(String(req._id)),
            status: "REJECTED",
            decidedByUserId: params.actorUserId,
        });

        return { ok: true };
    }

    async cancelRequest(params: { actorUserId: string; requestId: string }) {
        const req = await this.joinRepo.findById(params.requestId);
        if (!req) throw new AppException(404, "REQUEST_NOT_FOUND", "Request not found");
        if (req.status !== "PENDING") throw new AppException(409, "REQUEST_NOT_PENDING", "Request is not pending");

        // CANCEL: csak az tudja, aki létrehozta (apply esetén user, invite esetén a meghívó)
        if (String(req.createdByUserId) !== String(params.actorUserId)) {
            throw new AppException(403, "NOT_OWNER_OF_REQUEST", "Not allowed");
        }

        await this.joinRepo.updateStatus({
            id: new Types.ObjectId(String(req._id)),
            status: "CANCELLED",
            decidedByUserId: params.actorUserId,
        });

        return { ok: true };
    }
}
