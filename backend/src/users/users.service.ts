// backend/src/users/users.service.ts
import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User, UserDocument } from "./user.schema";
import * as bcrypt from "bcryptjs";
import { UpdateMeDto } from "./dto/update-me.dto";

@Injectable()
export class UsersService {
    constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

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
                    filter: { username: `user${i}` },
                    update: { $setOnInsert: { username: `user${i}`, password: passwordHash } },
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
}
