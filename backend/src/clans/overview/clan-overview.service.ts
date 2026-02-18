// backend/src/clans/clans.service.ts
import { Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {Model, Types} from "mongoose";
import {Clan, ClanDocument} from "../core/clans.schema";
import {CreateClanDto} from "./dto/create-clan.dto";
import {EditClanDto} from "./dto/edit-clan.dto";
import {ClanPermissions} from "../roles/clan-roles.permissions";
import {AppException} from "../../common/errors/app-exception"
import {BaseRoles} from "../roles/clan-roles.constants";
import {ClansRepository} from "../clans.repository";
import {ClansOverviewRepository} from "./clan-overview.repository"

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
        @InjectModel(Clan.name) private clanModel: Model<ClanDocument>,
        private readonly clansRepo: ClansRepository,
        private readonly clansOverviewRepo: ClansOverviewRepository,
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

    async createClan(ownerUserId: string, dto: CreateClanDto) {
        const slug = (dto.slug?.trim().toLowerCase() || slugify(dto.name));
        if (!slug) throw new AppException(409, "INVALID_CLAN_SLUG", "Invalid clan slug", {slug});

        const exists = await this.clanModel.exists({slug});
        if (exists) throw new AppException(409, "CLAN_SLUG_TAKEN", "Clan slug already taken", {slug});


        const created = await this.clanModel.create({
            name: dto.name.trim(),
            slug,
            roles: BaseRoles,
            members: [
                {userId: new Types.ObjectId(ownerUserId), roleKey: "owner"},
            ],
        });

        return {
            id: String(created._id),
            name: created.name,
            slug: created.slug,
            myRole: "owner",
        };
    }

    async editClan(userId: string, dto: EditClanDto) {
        if (!dto.name && !dto.slug) {
            throw new AppException(400, "NOTHING_TO_UPDATE", "Nothing to update");
        }
        const clan = await this.clanModel
            .findOne({"members.userId": new Types.ObjectId(userId)})
            .exec();

        if (!clan) {
            throw new AppException(404, "CLAN_NOT_FOUND", "Clan not found");
        }

        const member = clan.members.find((m) => String(m.userId) === String(userId));
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
            if (!newSlug) throw new AppException(409, "INVALID_CLAN_SLUG", "Invalid clan slug", {slug: dto.slug});

            if (newSlug !== clan.slug) {
                const exists = await this.clanModel.exists({slug: newSlug, _id: {$ne: clan._id}});
                if (exists) throw new AppException(409, "CLAN_SLUG_TAKEN", "Clan slug already taken", {slug: newSlug});
                clan.slug = newSlug;
            }
        }

        await clan.save();

        return {
            id: String(clan._id),
            name: clan.name,
            slug: clan.slug,
        };
    }

    async getMyClan(userId: string) {
        const clan = await this.clanModel
            .findOne({"members.userId": new Types.ObjectId(userId)})
            .exec();

        if (!clan) {
            throw new AppException(404, "CLAN_NOT_FOUND", "Clan not found");
        }

        const myRole = this.getMemberRoleKey(clan, userId);
        if (!myRole) {
            throw new AppException(403, "NOT_CLAN_MEMBER", "Not a clan member");
        }

        const role = clan.roles.find((r) => r.key === myRole);
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
