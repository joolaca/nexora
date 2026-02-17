// backend/src/users/users.service.ts
import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import * as bcrypt from "bcryptjs";
import { UpdateMeDto } from "./dto/update-me.dto";
import { UsersRepository } from "./users.repository";
import { UsersListRepository, type UsersClanFilter, type UsersSortKey } from "./users.list.repository";
import { ClansService } from "../clans/overview/clan-overview.service";

@Injectable()
export class UsersService {
    constructor(
        private readonly usersRepo: UsersRepository,
        private readonly usersListRepo: UsersListRepository,
        private readonly clansService: ClansService
    ) {}

    // Used by AuthService
    findByUsername(username: string) {
        return this.usersRepo.findByUsername(username);
    }

    // Used by AuthService
    findById(id: string) {
        return this.usersRepo.findById(id);
    }

    async seedTestUsers(count = 50, plainPassword = "123") {
        const passwordHash = await bcrypt.hash(plainPassword, 10);

        const res = await this.usersRepo.bulkUpsertSeedUsers({ count, passwordHash });

        return {
            inserted: res.upsertedCount || 0,
            matched: res.matchedCount || 0,
            modified: res.modifiedCount || 0,
        };
    }

    async createUser(username: string, plainPassword: string) {
        const exists = await this.usersRepo.findByUsername(username);
        if (exists) throw new ConflictException("Username already taken");

        const passwordHash = await bcrypt.hash(plainPassword, 10);
        const created = await this.usersRepo.createUser({ username, passwordHash });

        return { id: String(created._id), username: created.username };
    }

    async updateMe(userId: string, dto: UpdateMeDto) {
        const user = await this.usersRepo.findById(userId);
        if (!user) throw new BadRequestException("User not found");

        const ok = await bcrypt.compare(dto.currentPassword, user.password);
        if (!ok) throw new UnauthorizedException("Invalid current password");

        if (dto.newUsername) {
            const newU = dto.newUsername.trim().toLowerCase();

            if (newU !== user.username) {
                const exists = await this.usersRepo.existsByUsername(newU, String(user._id));
                if (exists) throw new ConflictException("Username already taken");
                user.username = newU;
            }
        }

        if (dto.newPassword) {
            user.password = await bcrypt.hash(dto.newPassword, 10);
        }

        await this.usersRepo.save(user);

        return { id: String(user._id), username: user.username };
    }

    async listUsers(params: {
        limit?: number;
        page?: number;
        sort?: UsersSortKey;
        minRank?: number;
        maxRank?: number;
        clan?: UsersClanFilter;
    }) {
        const limit = params.limit ?? 20;
        const page = params.page ?? 1;
        const sort: UsersSortKey = (params.sort ?? "rank_desc") as UsersSortKey;

        const skip = (page - 1) * limit;

        const filter = this.usersListRepo.buildFilter({
            minRank: params.minRank,
            maxRank: params.maxRank,
            clan: params.clan ?? "any",
        });

        const total = await this.usersListRepo.countUsers(filter);
        const users = await this.usersListRepo.findUsersPage(filter, sort, skip, limit);

        const clanIds = Array.from(
            new Set(
                users
                    .map((u: any) => u.clanId)
                    .filter(Boolean)
                    .map((id: any) => String(id))
            )
        );

        const clanById = await this.clansService.getSummariesByIds(clanIds);

        const items = users.map((u: any) => {
            const clan = u.clanId ? clanById.get(String(u.clanId)) ?? null : null;
            return { id: String(u._id), username: u.username, rank: u.rank, clan };
        });

        const totalPages = Math.max(1, Math.ceil(total / limit));

        return {
            items,
            meta: {
                page,
                limit,
                total,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1,
                sort,
                filters: {
                    minRank: params.minRank ?? null,
                    maxRank: params.maxRank ?? null,
                    clan: params.clan ?? "any",
                },
            },
        };
    }
}
