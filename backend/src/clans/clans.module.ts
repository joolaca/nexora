// backend/src/clans/clans.module.ts
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { Clan, ClanSchema } from "./clan.schema";
import { ClansRepository } from "./clans.repository";
import { ClansService } from "./clans.service";

// ✅ overview domain
import { ClansController } from "./overview/clans.controller";

// ✅ requests domain (régi join)
import { ClanRequestsController } from "./requests/clan-requests.controller";
import { ClanRequestsService } from "./requests/clan-requests.service";
import { ClanRequestsRepository } from "./requests/clan-requests.repository";
import { ClanJoinRequest, ClanJoinRequestSchema } from "./requests/clan-join-request.schema";

// ✅ user model kell a requests-hez
import { User, UserSchema } from "../users/user.schema";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Clan.name, schema: ClanSchema },
            { name: ClanJoinRequest.name, schema: ClanJoinRequestSchema },
            { name: User.name, schema: UserSchema },
        ]),
    ],
    controllers: [ClansController, ClanRequestsController],
    providers: [ClansService, ClansRepository, ClanRequestsService, ClanRequestsRepository],
    exports: [ClansService],
})
export class ClansModule {}
