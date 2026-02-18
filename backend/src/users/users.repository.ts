// backend/src/users/users.repository.ts
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User, UserDocument } from "./user.schema";

@Injectable()
export class UsersRepository {
    constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {}

    findByUsername(username: string) {
        return this.userModel.findOne({ username: username.toLowerCase() }).exec();
    }

    async findById(userId: string, session?: any) {
        const q = this.userModel.findById(userId);
        if (session) q.session(session);
        return q.exec();
    }

    existsByUsername(username: string, excludeUserId?: string) {
        const u = username.toLowerCase();
        const filter: any = { username: u };
        if (excludeUserId) filter._id = { $ne: excludeUserId };
        return this.userModel.exists(filter);
    }

    async createUser(params: { username: string; passwordHash: string; rank?: number }) {
        return await this.userModel.create({
            username: params.username.toLowerCase(),
            password: params.passwordHash,
            rank: params.rank ?? 0,
        });

    }

    async save(doc: UserDocument) {
        return doc.save();
    }

    async bulkUpsertSeedUsers(params: { count: number; passwordHash: string }) {
        const ops = [];
        for (let i = 1; i <= params.count; i++) {
            const rankRandom = Math.floor(Math.random() * 1000);

            ops.push({
                updateOne: {
                    filter: { username: `user${i}` },
                    update: {
                        $setOnInsert: { username: `user${i}`, password: params.passwordHash, rank: rankRandom },
                    },
                    upsert: true,
                },
            });
        }

        return this.userModel.bulkWrite(ops, { ordered: false });
    }
}
