// backend/src/clans/requests/clan-requests.controller.ts
import { Body, Controller, Get,  Post, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/jwt-auth.guard";
import { ClanRequestService } from "./clan-requests.service";
import { InviteToClanDto } from "./dto/invite.dto";

@UseGuards(JwtAuthGuard)
@Controller("clans")
export class ClanRequestController {
    constructor(private readonly requests: ClanRequestService) {}


    // CLAN -> USER invite
    @Post("invite")
    invite(@Req() req: any, @Body() dto: InviteToClanDto) {
        return this.requests.inviteToClan({
            actorUserId: req.user.userId,
            targetUserId: dto.userId,
        });
    }

    // my requests (user oldalon: apply + invite listázás)
    @Get("requests/me")
    my(@Req() req: any) {
        return this.requests.listMyRequests(req.user.userId);
    }


    @Get("get-invite-request-list")
    getInviteRequestsList(@Req() req: any) {
        return this.requests.getInviteRequestsList({actorUserId: req.user.userId,});
    }

}
