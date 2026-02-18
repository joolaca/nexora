// backend/src/clans/requests/clan-requests.controller.ts
import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/jwt-auth.guard";
import { ClanRequestService } from "./clan-requests.service";
import { InviteToClanDto } from "./dto/invite.dto";

@UseGuards(JwtAuthGuard)
@Controller("clans")
export class ClanRequestController {
    constructor(private readonly requests: ClanRequestService) {}

    // USER -> CLAN apply
    @Post(":clanId/apply")
    apply(@Req() req: any, @Param("clanId") clanId: string) {
        return this.requests.applyToClan({ actorUserId: req.user.userId, clanId });
    }

    // CLAN -> USER invite
    @Post(":clanId/invite")
    invite(@Req() req: any, @Param("clanId") clanId: string, @Body() dto: InviteToClanDto) {
        return this.requests.inviteToClan({
            actorUserId: req.user.userId,
            clanId,
            targetUserId: dto.userId,
        });
    }

    // my requests (user oldalon: apply + invite listázás)
    @Get("requests/me")
    my(@Req() req: any) {
        return this.requests.listMyRequests(req.user.userId);
    }

    // clan pending (clan admin/owner oldalon)
    @Get(":clanId/requests")
    clanPending(@Req() req: any, @Param("clanId") clanId: string) {
        return this.requests.listClanPendingRequests({ actorUserId: req.user.userId, clanId });
    }

    @Get("get-invite-request-list")
    getInviteRequestsList(@Req() req: any) {
        return this.requests.getInviteRequestsList({actorUserId: req.user.userId,});
    }

    // accept / reject / cancel (egységes)
    @Post("requests/:requestId/accept")
    accept(@Req() req: any, @Param("requestId") requestId: string) {
        return this.requests.acceptRequest({ actorUserId: req.user.userId, requestId });
    }

    @Post("requests/:requestId/reject")
    reject(@Req() req: any, @Param("requestId") requestId: string) {
        return this.requests.rejectRequest({ actorUserId: req.user.userId, requestId });
    }

    @Post("requests/:requestId/cancel")
    cancel(@Req() req: any, @Param("requestId") requestId: string) {
        return this.requests.cancelRequest({ actorUserId: req.user.userId, requestId });
    }
}
