import {Body, Controller, Get, Param, Post, Req, UseGuards} from "@nestjs/common";
import {JwtAuthGuard} from "../../auth/jwt-auth.guard";
import {ClanRequestService} from "./clan-requests.service";
import {InviteToClanDto} from "./dto/invite.dto";
import {ClanPermissionGuard} from "../guards/clan-permission.guard";
import {RequireClanPermission} from "../guards/require-clan-permission.decorator";
import {ClanPermissions} from "../roles/clan-roles.permissions";

@UseGuards(JwtAuthGuard)
@Controller("clans")
export class ClanRequestController {
    constructor(private readonly requests: ClanRequestService) {
    }

    // CLAN -> USER invite
    @Post("invite")
    @UseGuards(ClanPermissionGuard)
    @RequireClanPermission(ClanPermissions.RequestsManage)
    invite(@Req() req: any, @Body() dto: InviteToClanDto) {
        return this.requests.inviteToClan({
            actorUserId: req.clanAuth.actorUserId,
            clanId: req.clanAuth.clanId,
            targetUserId: dto.userId,
        });
    }

    @Get("requests/invites/pending")
    @UseGuards(ClanPermissionGuard)
    @RequireClanPermission(ClanPermissions.RequestsManage)
    getInviteRequestsList(@Req() req: any) {
        return this.requests.getInviteRequestsList({
            clanId: req.clanAuth.clanId,
        });
    }


    @Post("requests/:requestId/cancel")
    @UseGuards(ClanPermissionGuard)
    @RequireClanPermission(ClanPermissions.RequestsManage)
    cancelInvite(@Req() req: any, @Param("requestId") requestId: string) {
        return this.requests.cancelInvite({
            actorUserId: req.clanAuth.actorUserId,
            clanId: req.clanAuth.clanId,
            requestId,
        });
    }

    @Get("requests/my-invites")
    myInvites(@Req() req: any) {
        return this.requests.getMyInvites(req.user.userId);
    }

}