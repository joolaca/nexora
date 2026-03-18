// backend/src/clans/overview/clan-overview.service.ts
import { Injectable } from "@nestjs/common";
import { AppException } from "../../common/errors/app-exception";
import { ClansOverviewRepository } from "./clan-overview.repository";
import { ClansRepository } from "../core/clans.repository";

@Injectable()
export class ClanOverviewService {
    constructor(
        private readonly clansRepo: ClansRepository,
        private readonly clansOverviewRepo: ClansOverviewRepository,
    ) {}

    private getMemberRoleKey(clan: any, userId: string): string | null {
        const member = clan.members.find((m: any) => String(m.userId) === String(userId));
        return member?.roleKey ?? null;
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