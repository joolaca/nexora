// backend/src/seed/seed.service.ts
import {Injectable, Logger} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import {Clan, ClanDocument} from "../clans/core/clans.schema";
import {User, UserDocument} from "../users/users.schema";
import {assignUsersToClans, seedClans} from "../clans/core/clans.seed";
import {UsersBuilderService} from "../users/users-builder.service";
import {UserRole} from "../users/user-role.enum";

@Injectable()
export class SeedService {
    private readonly logger = new Logger(SeedService.name);

    constructor(
        private readonly usersBuilderService: UsersBuilderService,
        @InjectModel(Clan.name) private readonly clanModel: Model<ClanDocument>,
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    ) {}

    async clearCollections() {
        this.logger.log("Clearing users and clans collections...");

        await this.userModel.deleteMany({});
        await this.clanModel.deleteMany({});

        this.logger.log("Users and clans collections cleared.");
    }

    async run() {
        // 0) Clear old data first
        await this.clearCollections();

        // 1) Clans
        const clans = await seedClans({ clanModel: this.clanModel });

        // 2) Users
        const count = 150;

        const createdUsers: any[] = [];

    // 1) Admin user
        const adminUser = await this.usersBuilderService.createTestUser({
            username: "user1",
            plainPassword: "123",
            role: UserRole.ADMIN,
        });

        createdUsers.push(adminUser);

        // 2) Többi user
        for (let i = createdUsers.length +1 ; i < count; i++) {
            const user = await this.usersBuilderService.createTestUser({
                username: `user${i}`,
                plainPassword: "123",
            });

            createdUsers.push(user);
        }

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
            cleared: {
                users: true,
                clans: true,
            },
            clans: {
                clan1: { id: String(clans.clan1._id), slug: clans.clan1.slug },
                clan2: { id: String(clans.clan2._id), slug: clans.clan2.slug },
                clan3: { id: String(clans.clan3._id), slug: clans.clan3.slug },
            },
            users: {
                inserted: createdUsers.length,
            },
            assign: assignRes,
        };
    }
}