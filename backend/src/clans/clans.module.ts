// backend/src/clans/clans.module.ts
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Clan, ClanSchema } from "./core/clans.schema";
import { ClansController } from "./overview/clan-overview.controller";
import { ClansService } from "./overview/clan-overview.service";
import { ClansRepository } from "./overview/clan-overview.repository";

import { ClanRequestController } from "./requests/clan-requests.controller";
import { ClanRequestService } from "./requests/clan-requests.service";
import { ClanRequestRepository } from "./requests/clan-requests.repository";
import { ClanRequest, ClanRequestSchema } from "./requests/clan-request.schema";

import { User, UserSchema } from "../users/user.schema";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Clan.name, schema: ClanSchema },
            { name: ClanRequest.name, schema: ClanRequestSchema },
            { name: User.name, schema: UserSchema },
        ]),
    ],
    controllers: [ClansController, ClanRequestController],
    providers: [
        ClansService,
        ClansRepository,
        ClanRequestService,
        ClanRequestRepository,
    ],
    exports: [ClansService, ClanRequestService],
})
export class ClansModule {}
