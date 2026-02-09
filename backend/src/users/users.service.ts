// backend/src/users/users.service.ts
import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { User, UserDocument } from "./user.schema";
import * as bcrypt from "bcryptjs";
import { UpdateMeDto } from "./dto/update-me.dto";
import { Clan, ClanDocument } from "../clans/clan.schema";

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        @InjectModel(Clan.name) private clanModel: Model<ClanDocument>
    ) {}

    findByUsername(username: string) {
        return this.userModel.findOne({ username: username.toLowerCase() }).exec();
    }

    findById(id: string) {
        return this.userModel.findById(id).exec();
    }

    async seedTestUsers(count = 50, plainPassword = "123") {
        const passwordHash = await bcrypt.hash(plainPassword, 10);

        const ops = [];
        for (let i = 1; i <= count; i++) {
            let rankRandom = Math.floor(Math.random() * 1000);
            ops.push({
                updateOne: {
                    filter: { username: `user${i}` },
                    update: {
                        $setOnInsert: { username: `user${i}`, password: passwordHash, rank: rankRandom }
                    },
                    upsert: true,
                },
            });
        }

        const res = await this.userModel.bulkWrite(ops, { ordered: false });

        return {
            inserted: res.upsertedCount || 0,
            matched: res.matchedCount || 0,
            modified: res.modifiedCount || 0,
        };
    }

    async createUser(username: string, plainPassword: string) {
        const exists = await this.findByUsername(username);
        if (exists) throw new ConflictException("Username already taken");

        const passwordHash = await bcrypt.hash(plainPassword, 10);

        const created = await this.userModel.create({
            username,
            password: passwordHash,
        });

        return { id: String(created._id), username: created.username };
    }

    async updateMe(userId: string, dto: UpdateMeDto) {
        const user = await this.userModel.findById(userId).exec();
        if (!user) throw new BadRequestException("User not found");

        const ok = await bcrypt.compare(dto.currentPassword, user.password);
        if (!ok) throw new UnauthorizedException("Invalid current password");

        if (dto.newUsername) {
            const newU = dto.newUsername.trim().toLowerCase();

            if (newU !== user.username) {
                const exists = await this.userModel.exists({ username: newU, _id: { $ne: user._id } });
                if (exists) throw new ConflictException("Username already taken");
                user.username = newU;
            }
        }

        if (dto.newPassword) {
            user.password = await bcrypt.hash(dto.newPassword, 10);
        }

        await user.save();

        return { id: String(user._id), username: user.username };
    }


    async listUsers(params: { limit?: number; sort?: string }) {
        const limit = params.limit ?? 20;

        const sort = params.sort ?? "rank_desc";
        const sortMap: Record<string, Record<string, 1 | -1>> = {
            rank_desc: { rank: -1, username: 1 },
            rank_asc: { rank: 1, username: 1 },
            username_asc: { username: 1 },
            username_desc: { username: -1 },
        };
        const sortSpec = sortMap[sort] ?? sortMap.rank_desc;

        const users = await this.userModel
            .find({}, { username: 1, rank: 1, clanId: 1 })
            .sort(sortSpec)
            .limit(limit)
            .lean()
            .exec();

        const clanIds = Array.from(
            new Set(
                users
                    .map((u: any) => u.clanId)
                    .filter(Boolean)
                    .map((id: any) => String(id))
            )
        );

        const clans = clanIds.length
            ? await this.clanModel
                .find({ _id: { $in: clanIds.map((id) => new Types.ObjectId(id)) } }, { name: 1, slug: 1 })
                .lean()
                .exec()
            : [];

        const clanById = new Map<string, { id: string; name: string; slug: string }>();
        for (const c of clans as any[]) {
            clanById.set(String(c._id), { id: String(c._id), name: c.name, slug: c.slug });
        }

        return users.map((u: any) => {
            const clan = u.clanId ? clanById.get(String(u.clanId)) ?? null : null;

            return {
                id: String(u._id),
                username: u.username,
                rank: u.rank,
                clan,
            };
        });
    }

}
