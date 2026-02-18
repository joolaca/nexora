// backend/src/clans/clans.module.ts
import {Module} from "@nestjs/common";
import {MongooseModule} from "@nestjs/mongoose";
import {Clan, ClanSchema} from "./core/clans.schema";
import {ClansController} from "./overview/clan-overview.controller";
import {ClansService} from "./overview/clan-overview.service";
import {ClansOverviewRepository} from "./overview/clan-overview.repository";
import {ClansRepository} from "./clans.repository";
import {ClanRequestController} from "./requests/clan-requests.controller";
import {ClanRequestService} from "./requests/clan-requests.service";
import {ClanRequestRepository} from "./requests/clan-requests.repository";
import {ClanRequest, ClanRequestSchema} from "./requests/clan-request.schema";
import {User, UsersSchema} from "../users/users.schema";
import {UsersRepository} from "../users/users.repository";
import {ClanInviteFlowRepository} from "./requests/clan-invite-flow.repository";

@Module({
    imports: [
        MongooseModule.forFeature([
            {name: Clan.name, schema: ClanSchema},
            {name: ClanRequest.name, schema: ClanRequestSchema},
            {name: User.name, schema: UsersSchema},
        ]),
    ],
    controllers: [ClansController, ClanRequestController],
    providers: [
        ClansService,
        ClansRepository,
        ClansOverviewRepository,
        ClanRequestService,
        ClanRequestRepository,
        UsersRepository,
        ClanInviteFlowRepository,

    ],
    exports: [ClansService, ClanRequestService],
})
export class ClansModule {
}
