// backend/src/clans/clans.module.ts
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Clan, ClanSchema } from "./core/clans.schema";
import { ClansController } from "./overview/clan-overview.controller";
import { ClansService } from "./overview/clan-overview.service";
import { ClansRepository } from "./overview/clan-overview.repository";

// ✅ join feature
import { ClanJoinController } from "./requests/clan-requests.controller";
import { ClanJoinService } from "./requests/clan-requests.service";
import { ClanJoinRepository } from "./requests/clan-requests.repository";
import { ClanRequest, ClanRequestSchema } from "./requests/clan-request.schema";

// ✅ user model (joinhoz kell)
import { User, UserSchema } from "../users/user.schema";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Clan.name, schema: ClanSchema },
            { name: ClanRequest.name, schema: ClanRequestSchema },
            { name: User.name, schema: UserSchema },
        ]),
    ],
    controllers: [ClansController, ClanJoinController],
    providers: [ClansService, ClansRepository, ClanJoinService, ClanJoinRepository],
    exports: [ClansService],
})
export class ClansModule {}
