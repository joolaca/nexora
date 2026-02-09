// backend/src/seed/seed.service.ts
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { UsersService } from "../users/users.service";
import { Clan, ClanDocument } from "../clans/clan.schema";
import { User, UserDocument } from "../users/user.schema";
import { seedClansWithMembers } from "../clans/clans.seed";

@Injectable()
export class SeedService {
    constructor(
        private readonly users: UsersService,
        @InjectModel(Clan.name) private readonly clanModel: Model<ClanDocument>,
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>
    ) {}

    async run() {
        const usersRes = await this.users.seedTestUsers(50, "123");
        const clansRes = await seedClansWithMembers({
            clanModel: this.clanModel,
            userModel: this.userModel,
        });

        return {
            users: usersRes,
            clans: clansRes,
        };
    }
}
