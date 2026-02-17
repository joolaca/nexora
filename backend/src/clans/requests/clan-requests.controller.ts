// backend/src/clans/join/clan-join.controller.ts
import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/jwt-auth.guard";
import { ClanJoinService } from "./clan-requests.service";
import { InviteToClanDto } from "./dto/invite.dto";

@UseGuards(JwtAuthGuard)
@Controller("clans")
export class ClanJoinController {
    constructor(private readonly join: ClanJoinService) {}

    // USER -> CLAN apply
    @Post(":clanId/apply")
    apply(@Req() req: any, @Param("clanId") clanId: string) {
        return this.join.applyToClan({ actorUserId: req.user.userId, clanId });
    }

    // CLAN -> USER invite
    @Post(":clanId/invite")
    invite(@Req() req: any, @Param("clanId") clanId: string, @Body() dto: InviteToClanDto) {
        return this.join.inviteToClan({
            actorUserId: req.user.userId,
            clanId,
            targetUserId: dto.userId,
        });
    }

    // my requests (user oldalon: apply + invite listázás)
    @Get("requests/me")
    my(@Req() req: any) {
        return this.join.listMyRequests(req.user.userId);
    }

    // clan pending (clan admin/owner oldalon)
    @Get(":clanId/requests")
    clanPending(@Req() req: any, @Param("clanId") clanId: string) {
        return this.join.listClanPendingRequests({ actorUserId: req.user.userId, clanId });
    }

    // accept / reject / cancel (egységes)
    @Post("requests/:requestId/accept")
    accept(@Req() req: any, @Param("requestId") requestId: string) {
        return this.join.acceptRequest({ actorUserId: req.user.userId, requestId });
    }

    @Post("requests/:requestId/reject")
    reject(@Req() req: any, @Param("requestId") requestId: string) {
        return this.join.rejectRequest({ actorUserId: req.user.userId, requestId });
    }

    @Post("requests/:requestId/cancel")
    cancel(@Req() req: any, @Param("requestId") requestId: string) {
        return this.join.cancelRequest({ actorUserId: req.user.userId, requestId });
    }
}
