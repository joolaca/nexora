//backend/src/users/users.service.ts
import {ConflictException, Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import {User, UserDocument} from "./user.schema";
import * as bcrypt from "bcryptjs";

@Injectable()
export class UsersService {
    constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {
    }

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
            ops.push({
                updateOne: {
                    filter: {username: `user${i}`},
                    update: {$setOnInsert: {username: `user${i}`, password: passwordHash}},
                    upsert: true,
                },
            });
        }

        const res = await this.userModel.bulkWrite(ops, {ordered: false});

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
}
