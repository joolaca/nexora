// backend/src/clans/overview/clan-overview.service.ts
import { Injectable } from "@nestjs/common";
import { InjectConnection } from "@nestjs/mongoose";
import { Connection } from "mongoose";
import { CreateClanDto } from "./dto/create-clan.dto";
import { EditClanDto } from "./dto/edit-clan.dto";
import { ClanPermissions } from "../roles/clan-roles.permissions";
import { AppException } from "../../common/errors/app-exception";
import { BaseRoles } from "../roles/clan-roles.constants";
import { ClansRepository } from "../clans.repository";
import { ClansOverviewRepository } from "./clan-overview.repository";
import { UsersRepository } from "../../users/users.repository";

function slugify(input: string) {
    return input
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 32);
}

@Injectable()
export class ClansService {
    constructor(
        @InjectConnection() private readonly connection: Connection,
        private readonly clansRepo: ClansRepository,
        private readonly clansOverviewRepo: ClansOverviewRepository,
        private readonly usersRepo: UsersRepository,
    ) {}

    private getMemberRoleKey(clan: any, userId: string): string | null {
        const m = clan.members.find((x: any) => String(x.userId) === String(userId));
        return m?.roleKey ?? null;
    }

    private hasPermission(clan: any, userId: string, perm: string): boolean {
        const roleKey = this.getMemberRoleKey(clan, userId);

        if (!roleKey) {
            return false;
        }

        const role = clan.roles.find((r: any) => r.key === roleKey);

        if (!role) {
            return false;
        }

        return role.permissions.includes(perm);
    }

    async createClan(ownerUserId: string, dto: CreateClanDto) {
        const slug = dto.slug?.trim().toLowerCase() || slugify(dto.name);

        if (!slug) {
            throw new AppException(409, "INVALID_CLAN_SLUG", "Invalid clan slug", { slug });
        }

        const ownerUser = await this.usersRepo.findById(ownerUserId);

        if (!ownerUser) {
            throw new AppException(404, "USER_NOT_FOUND", "User not found", { userId: ownerUserId });
        }

        if (ownerUser.clanId) {
            throw new AppException(409, "USER_ALREADY_IN_CLAN", "User is already in a clan", {
                userId: ownerUserId,
                clanId: String(ownerUser.clanId),
            });
        }

        const exists = await this.clansOverviewRepo.existsBySlug(slug);

        if (exists) {
            throw new AppException(409, "CLAN_SLUG_TAKEN", "Clan slug already taken", { slug });
        }

        const session = await this.connection.startSession();

        try {
            session.startTransaction();

            const created = await this.clansOverviewRepo.createClan(
                {
                    name: dto.name.trim(),
                    slug,
                    ownerUserId,
                    roles: BaseRoles,
                },
                session,
            );

            await this.usersRepo.setClanId(ownerUserId, String(created._id), session);

            await session.commitTransaction();

            return {
                id: String(created._id),
                name: created.name,
                slug: created.slug,
                myRole: "owner",
            };
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            await session.endSession();
        }
    }

    async editClan(userId: string, dto: EditClanDto) {
        if (!dto.name && !dto.slug) {
            throw new AppException(400, "NOTHING_TO_UPDATE", "Nothing to update");
        }

        const clan = await this.clansRepo.findByMemberUserId(userId);

        if (!clan) {
            throw new AppException(404, "CLAN_NOT_FOUND", "Clan not found");
        }

        const member = clan.members.find((m: any) => String(m.userId) === String(userId));

        if (!member) {
            throw new AppException(403, "NOT_CLAN_MEMBER", "Not a clan member");
        }

        if (!this.hasPermission(clan, userId, ClanPermissions.Edit)) {
            throw new AppException(403, "NO_PERMISSION", "No permission");
        }

        if (dto.name) {
            clan.name = dto.name.trim();
        }

        if (dto.slug) {
            const newSlug = dto.slug.trim().toLowerCase();

            if (!newSlug) {
                throw new AppException(409, "INVALID_CLAN_SLUG", "Invalid clan slug", { slug: dto.slug });
            }

            if (newSlug !== clan.slug) {
                const exists = await this.clansOverviewRepo.existsBySlug(newSlug, String(clan._id));

                if (exists) {
                    throw new AppException(409, "CLAN_SLUG_TAKEN", "Clan slug already taken", {
                        slug: newSlug,
                    });
                }

                clan.slug = newSlug;
            }
        }

        await this.clansRepo.save(clan);

        return {
            id: String(clan._id),
            name: clan.name,
            slug: clan.slug,
        };
    }

    async getMyClan(userId: string) {
        const clan = await this.clansRepo.findByMemberUserId(userId);

        if (!clan) {
            throw new AppException(404, "CLAN_NOT_FOUND", "Clan not found");
        }

        const myRole = this.getMemberRoleKey(clan, userId);

        if (!myRole) {
            throw new AppException(403, "NOT_CLAN_MEMBER", "Not a clan member");
        }

        const role = clan.roles.find((r: any) => r.key === myRole);
        const permissions = role?.permissions ?? [];

        return {
            id: String(clan._id),
            name: clan.name,
            slug: clan.slug,
            myRole,
            permissions,
        };
    }

    async getSummariesByIds(ids: string[]) {
        const clans = await this.clansOverviewRepo.findByIds(ids);

        const map = new Map<string, { id: string; name: string; slug: string }>();

        for (const c of clans as any[]) {
            map.set(String(c._id), {
                id: String(c._id),
                name: c.name,
                slug: c.slug,
            });
        }

        return map;
    }
}