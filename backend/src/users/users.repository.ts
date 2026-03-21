// backend/src/users/users.repository.ts
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { ClientSession, Model, Types } from "mongoose";
import { User, UserDocument } from "./users.schema";
import { CreateUserDbParams } from "./users.types";

@Injectable()
export class UsersRepository {
    constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {}

    findByUsername(username: string) {
        return this.userModel.findOne({ username: username.toLowerCase() }).exec();
    }

    async findById(userId: string, session?: ClientSession) {
        const q = this.userModel.findById(userId);

        if (session) {
            q.session(session);
        }

        return q.exec();
    }

    existsByUsername(username: string, excludeUserId?: string) {
        const u = username.toLowerCase();
        const filter: any = { username: u };

        if (excludeUserId) {
            filter._id = { $ne: excludeUserId };
        }

        return this.userModel.exists(filter);
    }

    async createUser(params: CreateUserDbParams) {
        return this.userModel.create({
            username: params.username,
            password: params.passwordHash,
            rank: params.rank,
            about: params.about,
            role: params.role,
        });
    }

    async save(doc: UserDocument) {
        return doc.save();
    }

    async setClanId(userId: string, clanId: string | null, session?: ClientSession) {
        const update = clanId
            ? { $set: { clanId: new Types.ObjectId(clanId) } }
            : { $set: { clanId: null } };

        const q = this.userModel.updateOne(
            { _id: new Types.ObjectId(userId) },
            update,
        );

        if (session) {
            q.session(session);
        }

        return q.exec();
    }

    async clearClanIdForUsers(userIds: string[], session?: ClientSession) {
        if (!userIds.length) {
            return { matchedCount: 0, modifiedCount: 0 };
        }

        const q = this.userModel.updateMany(
            {
                _id: {
                    $in: userIds.map((id) => new Types.ObjectId(id)),
                },
            },
            {
                $set: {
                    clanId: null,
                },
            },
        );

        if (session) {
            q.session(session);
        }

        return q.exec();
    }

    async deleteById(userId: string) {
        return this.userModel.deleteOne({ _id: userId }).exec();
    }

    async deleteByUsername(username: string) {
        return this.userModel.deleteOne({ username: username.toLowerCase() }).exec();
    }
}