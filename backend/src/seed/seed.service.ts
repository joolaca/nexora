// backend/src/seed/seed.service.ts
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { UsersService } from "../users/users.service";
import { Clan, ClanDocument } from "../clans/clan.schema";
import { User, UserDocument } from "../users/user.schema";
import { seedClans, assignUsersToClans } from "../clans/clans.seed";

@Injectable()
export class SeedService {
    constructor(
        private readonly users: UsersService,
        @InjectModel(Clan.name) private readonly clanModel: Model<ClanDocument>,
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>
    ) {}

    async run() {
        // 1) Clans
        const clans = await seedClans({ clanModel: this.clanModel });

        // 2) Users
        const usersRes = await this.users.seedTestUsers(150, "123");

        // 3) Assign
        const assignRes = await assignUsersToClans({
            clanModel: this.clanModel,
            userModel: this.userModel,
            clanIds: {
                clan1Id: clans.clan1._id,
                clan2Id: clans.clan2._id,
                clan3Id: clans.clan3._id,
            },
        });

        return {
            clans: {
                clan1: { id: String(clans.clan1._id), slug: clans.clan1.slug },
                clan2: { id: String(clans.clan2._id), slug: clans.clan2.slug },
                clan3: { id: String(clans.clan3._id), slug: clans.clan3.slug },
            },
            users: usersRes,
            assign: assignRes,
        };
    }
}
