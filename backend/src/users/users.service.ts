// backend/src/users/users.service.ts
import {
    BadRequestException,
    ConflictException,
    Injectable,
    UnauthorizedException,
} from "@nestjs/common";
import * as bcrypt from "bcryptjs";
import { UpdateMeDto } from "./dto/update-me.dto";
import { UsersRepository, CreateUserDbParams } from "./users.repository";
import {
    UsersListRepository,
    type UsersClanFilter,
    type UsersSortKey,
} from "./users.list.repository";
import { ClansService } from "../clans/overview/clan-overview.service";
import { AppException } from "../common/errors/app-exception";

export type CreateUserInput = {
    username: string;
    plainPassword: string;
    rank?: number;
    about?: string;
};

@Injectable()
export class UsersService {
    constructor(
        private readonly usersRepo: UsersRepository,
        private readonly usersListRepo: UsersListRepository,
        private readonly clansService: ClansService,
    ) {}

    findByUsername(username: string) {
        return this.usersRepo.findByUsername(username);
    }

    findById(id: string) {
        return this.usersRepo.findById(id);
    }

    async getById(id: string) {
        const user = await this.usersRepo.findById(id);

        if (!user) {
            throw new AppException(404, "USER_NOT_FOUND", "User not found", { userId: id });
        }

        return user;
    }

    async buildCreateUserData(input: CreateUserInput): Promise<CreateUserDbParams> {
        return {
            username: input.username.trim().toLowerCase(),
            passwordHash: await bcrypt.hash(input.plainPassword, 10),
            rank: input.rank,
            about: input.about,
        };
    }

    async createUserRecord(input: CreateUserInput) {
        const prepared = await this.buildCreateUserData(input);
        return this.usersRepo.createUser(prepared);
    }

    async createUser(username: string, plainPassword: string) {
        const exists = await this.usersRepo.findByUsername(username);

        if (exists) {
            throw new ConflictException("Username already taken");
        }

        const created = await this.createUserRecord({
            username,
            plainPassword,
        });

        return {
            id: String(created._id),
            username: created.username,
        };
    }

    async deleteUserById(userId: string) {
        const res = await this.usersRepo.deleteById(userId);

        return {
            deleted: res.deletedCount || 0,
        };
    }

    async deleteUserByUsername(username: string) {
        const res = await this.usersRepo.deleteByUsername(username);

        return {
            deleted: res.deletedCount || 0,
        };
    }

    async updateMe(userId: string, dto: UpdateMeDto) {
        const user = await this.usersRepo.findById(userId);

        if (!user) {
            throw new BadRequestException("User not found");
        }

        const ok = await bcrypt.compare(dto.currentPassword, user.password);

        if (!ok) {
            throw new UnauthorizedException("Invalid current password");
        }

        if (dto.newUsername) {
            const newUsername = dto.newUsername.trim().toLowerCase();

            if (newUsername !== user.username) {
                const exists = await this.usersRepo.existsByUsername(newUsername, String(user._id));

                if (exists) {
                    throw new ConflictException("Username already taken");
                }

                user.username = newUsername;
            }
        }

        if (dto.newPassword) {
            user.password = await bcrypt.hash(dto.newPassword, 10);
        }

        await this.usersRepo.save(user);

        return {
            id: String(user._id),
            username: user.username,
        };
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
                    .map((id: any) => String(id)),
            ),
        );

        const clanById = await this.clansService.getSummariesByIds(clanIds);

        const items = users.map((u: any) => {
            const clan = u.clanId ? clanById.get(String(u.clanId)) ?? null : null;

            return {
                id: String(u._id),
                username: u.username,
                rank: u.rank,
                clan,
            };
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