// backend/src/users/users.repository.ts
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User, UserDocument } from "./users.schema";
import { CreateUserDbParams } from "./users.types";


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
        });
    }

    async save(doc: UserDocument) {
        return doc.save();
    }

    async deleteById(userId: string) {
        return this.userModel.deleteOne({ _id: userId }).exec();
    }

    async deleteByUsername(username: string) {
        return this.userModel.deleteOne({ username: username.toLowerCase() }).exec();
    }
}