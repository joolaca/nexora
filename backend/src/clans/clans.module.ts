// backend/src/clans/clans.module.ts
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Clan, ClanSchema } from "./clan.schema";
import { ClansController } from "./clans.controller";
import { ClansService } from "./clans.service";
import { ClansRepository } from "./clans.repository";

// ✅ join feature
import { ClanJoinController } from "./join/clan-join.controller";
import { ClanJoinService } from "./join/clan-join.service";
import { ClanJoinRepository } from "./join/clan-join.repository";
import { ClanJoinRequest, ClanJoinRequestSchema } from "./join/clan-join-request.schema";

// ✅ user model (joinhoz kell)
import { User, UserSchema } from "../users/user.schema";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Clan.name, schema: ClanSchema },
            { name: ClanJoinRequest.name, schema: ClanJoinRequestSchema },
            { name: User.name, schema: UserSchema },
        ]),
    ],
    controllers: [ClansController, ClanJoinController],
    providers: [ClansService, ClansRepository, ClanJoinService, ClanJoinRepository],
    exports: [ClansService],
})
export class ClansModule {}
