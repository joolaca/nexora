// backend/src/clans/clans.module.ts
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Clan, ClanSchema } from "./core/clans.schema";
import { ClanRequest, ClanRequestSchema } from "./requests/clan-request.schema";
import { User, UsersSchema } from "../users/users.schema";

import { ClansRepository } from "./core/clans.repository";
import { ClansOverviewRepository } from "./overview/clan-overview.repository";
import { ClanOverviewService } from "./overview/clan-overview.service";
import { ClansOverviewController } from "./overview/clan-overview.controller";

import { ClanManagementService } from "./management/clan-management.service";
import { ClanManagementController } from "./management/clan-management.controller";

import { ClanRequestService } from "./requests/clan-requests.service";
import { ClanRequestRepository } from "./requests/clan-requests.repository";
import { ClanInviteFlowRepository } from "./requests/clan-invite-flow.repository";
import { ClanRequestController } from "./requests/clan-requests.controller";

import { UsersRepository } from "../users/users.repository";
import { ClanPermissionGuard } from "./guards/clan-permission.guard";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Clan.name, schema: ClanSchema },
            { name: ClanRequest.name, schema: ClanRequestSchema },
            { name: User.name, schema: UsersSchema },
        ]),
    ],
    controllers: [
        ClansOverviewController,
        ClanManagementController,
        ClanRequestController,
    ],
    providers: [
        ClansRepository,
        ClansOverviewRepository,
        ClanOverviewService,
        ClanManagementService,
        ClanRequestService,
        ClanRequestRepository,
        ClanInviteFlowRepository,
        UsersRepository,
        ClanPermissionGuard,
    ],
    exports: [
        ClanOverviewService,
        ClanManagementService,
        ClanRequestService,
    ],
})
export class ClansModule {}