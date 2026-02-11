// backend/src/users/users.repository.ts
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { User, UserDocument } from "./user.schema";

export type UsersSortKey = "rank_desc" | "rank_asc" | "username_asc" | "username_desc";
export type UsersClanFilter = "any" | "in" | "none";

export type ListUsersRepoParams = {
    limit: number;
    page: number;
    sort: UsersSortKey;

    minRank?: number;
    maxRank?: number;
    clan?: UsersClanFilter;
};

@Injectable()
export class UsersRepository {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    ) {}

    buildFilter(params: Pick<ListUsersRepoParams, "minRank" | "maxRank" | "clan">) {
        const filter: any = {};

        if (params.minRank !== undefined || params.maxRank !== undefined) {
            filter.rank = {};
            if (params.minRank !== undefined) filter.rank.$gte = params.minRank;
            if (params.maxRank !== undefined) filter.rank.$lte = params.maxRank;
        }

        if (params.clan === "in") filter.clanId = { $ne: null };
        if (params.clan === "none") filter.clanId = null;

        return filter;
    }

    getSortSpec(sort: UsersSortKey) {
        const sortMap: Record<UsersSortKey, Record<string, 1 | -1>> = {
            rank_desc: { rank: -1, username: 1 },
            rank_asc: { rank: 1, username: 1 },
            username_asc: { username: 1 },
            username_desc: { username: -1 },
        };

        return sortMap[sort] ?? sortMap.rank_desc;
    }

    async countUsers(filter: any) {
        return this.userModel.countDocuments(filter).exec();
    }

    async findUsersPage(filter: any, sort: UsersSortKey, skip: number, limit: number) {
        const sortSpec = this.getSortSpec(sort);

        return this.userModel
            .find(filter, { username: 1, rank: 1, clanId: 1 })
            .sort(sortSpec)
            .skip(skip)
            .limit(limit)
            .lean()
            .exec();
    }


}
