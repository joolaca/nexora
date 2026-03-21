import { Injectable } from "@nestjs/common";
import { InjectConnection } from "@nestjs/mongoose";
import { Connection } from "mongoose";
import { CreateClanDto } from "./dto/create-clan.dto";
import { EditClanDto } from "./dto/edit-clan.dto";
import { AppException } from "../../common/errors/app-exception";
import { ClanPermissions } from "../roles/clan-roles.permissions";
import { BaseRoles } from "../roles/clan-roles.constants";
import { UsersRepository } from "../../users/users.repository";
import { ClanManagementRepository } from "./clan-management.repository";
import { ClanRequestRepository } from "../requests/clan-requests.repository";

function slugify(input: string) {
    return input
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 32);
}

function isMongoDuplicateKeyError(error: any): boolean {
    return !!error && typeof error === "object" && error.code === 11000;
}

@Injectable()
export class ClanManagementService {
    constructor(
        @InjectConnection() private readonly connection: Connection,
        private readonly clanManagementRepo: ClanManagementRepository,
        private readonly usersRepo: UsersRepository,
        private readonly clanRequestRepo: ClanRequestRepository,
    ) {}

    private mapClanCreateResult(clan: any) {
        const ownerMember = clan.members.find((x: any) => x.roleKey === "owner");

        return {
            id: String(clan._id),
            name: clan.name,
            slug: clan.slug,
            myRole: ownerMember?.roleKey ?? "owner",
        };
    }

    private getMemberRoleKey(clan: any, userId: string): string | null {
        const member = clan.members.find((x: any) => String(x.userId) === String(userId));
        return member?.roleKey ?? null;
    }

    private hasPermission(clan: any, userId: string, permission: string): boolean {
        const roleKey = this.getMemberRoleKey(clan, userId);

        if (!roleKey) {
            return false;
        }

        const role = clan.roles.find((r: any) => r.key === roleKey);

        if (!role) {
            return false;
        }

        return role.permissions.includes(permission);
    }

    async createClan(ownerUserId: string, dto: CreateClanDto, idempotencyKey?: string) {
        const normalizedKey = idempotencyKey?.trim() || undefined;

        if (normalizedKey) {
            const existingByRequest = await this.clanManagementRepo.findByCreateRequest(
                ownerUserId,
                normalizedKey,
            );

            if (existingByRequest) {
                return this.mapClanCreateResult(existingByRequest);
            }
        }

        const slug = dto.slug?.trim().toLowerCase() || slugify(dto.name);

        if (!slug) {
            throw new AppException(409, "INVALID_CLAN_SLUG");
        }

        const ownerUser = await this.usersRepo.findById(ownerUserId);

        if (!ownerUser) {
            throw new AppException(404, "USER_NOT_FOUND");
        }

        if (ownerUser.clanId) {
            throw new AppException(409, "USER_ALREADY_IN_CLAN");
        }

        const exists = await this.clanManagementRepo.existsBySlug(slug);

        if (exists) {
            throw new AppException(409, "CLAN_SLUG_TAKEN");
        }

        const session = await this.connection.startSession();

        try {
            session.startTransaction();

            const created = await this.clanManagementRepo.createClan(
                {
                    name: dto.name.trim(),
                    slug,
                    ownerUserId,
                    roles: BaseRoles,
                    requestId: normalizedKey,
                },
                session,
            );

            await this.usersRepo.setClanId(ownerUserId, String(created._id), session);

            await session.commitTransaction();

            return this.mapClanCreateResult(created);
        } catch (error) {
            await session.abortTransaction();

            if (normalizedKey && isMongoDuplicateKeyError(error)) {
                const existingByRequest = await this.clanManagementRepo.findByCreateRequest(
                    ownerUserId,
                    normalizedKey,
                );

                if (existingByRequest) {
                    return this.mapClanCreateResult(existingByRequest);
                }
            }

            throw error;
        } finally {
            await session.endSession();
        }
    }

    async editClan(userId: string, dto: EditClanDto) {
        if (!dto.name && !dto.slug) {
            throw new AppException(400, "NOTHING_TO_UPDATE");
        }

        const clan = await this.clanManagementRepo.findByMemberUserId(userId);

        if (!clan) {
            throw new AppException(404, "CLAN_NOT_FOUND");
        }

        const member = clan.members.find((m: any) => String(m.userId) === String(userId));

        if (!member) {
            throw new AppException(403, "NOT_CLAN_MEMBER");
        }

        if (!this.hasPermission(clan, userId, ClanPermissions.Edit)) {
            throw new AppException(403, "NO_PERMISSION");
        }

        if (dto.name) {
            clan.name = dto.name.trim();
        }

        if (dto.slug) {
            const newSlug = dto.slug.trim().toLowerCase();

            if (!newSlug) {
                throw new AppException(409, "INVALID_CLAN_SLUG");
            }

            if (newSlug !== clan.slug) {
                const exists = await this.clanManagementRepo.existsBySlug(newSlug, String(clan._id));

                if (exists) {
                    throw new AppException(409, "CLAN_SLUG_TAKEN");
                }

                clan.slug = newSlug;
            }
        }

        await this.clanManagementRepo.save(clan);

        return {
            id: String(clan._id),
            name: clan.name,
            slug: clan.slug,
        };
    }

    async deleteClanById(clanId: string) {
        const session = await this.connection.startSession();

        try {
            session.startTransaction();

            const clan = await this.clanManagementRepo.findById(clanId, session);

            if (!clan) {
                await session.commitTransaction();

                return {
                    deleted: 0,
                    clearedUsers: 0,
                    deletedRequests: 0,
                };
            }

            const memberUserIds = clan.members.map((member: any) => String(member.userId));

            const deleteRequestsRes = await this.clanRequestRepo.deleteByClanId(clanId, session);
            const clearUsersRes = await this.usersRepo.clearClanIdForUsers(memberUserIds, session);
            const deleteClanRes = await this.clanManagementRepo.deleteById(clanId, session);

            await session.commitTransaction();

            return {
                deleted: deleteClanRes.deletedCount || 0,
                clearedUsers: clearUsersRes.modifiedCount || 0,
                deletedRequests: deleteRequestsRes.deletedCount || 0,
            };
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            await session.endSession();
        }
    }
}