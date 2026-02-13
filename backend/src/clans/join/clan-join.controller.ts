// backend/src/clans/join/clan-join.controller.ts
import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/jwt-auth.guard";
import { ClanJoinService } from "./clan-join.service";
import { InviteToClanDto } from "./dto/invite.dto";
import {
    ApiBearerAuth,
    ApiBadRequestResponse,
    ApiForbiddenResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiTags,
    ApiUnauthorizedResponse,
    ApiConflictResponse,
} from "@nestjs/swagger";

@ApiTags("Clan Join")
@ApiBearerAuth("access-token")
@ApiUnauthorizedResponse({ description: "Missing, invalid, or expired token." })
@UseGuards(JwtAuthGuard)
@Controller("clans")
export class ClanJoinController {
    constructor(private readonly join: ClanJoinService) {}

    @ApiOperation({
        summary: "Apply to a clan",
        description: "Creates an APPLY request (user -> clan). If an INVITE exists, it may auto-accept.",
    })
    @ApiParam({ name: "clanId", description: "Target clan ID (Mongo ObjectId)" })
    @ApiOkResponse({ description: "Request created or auto-accepted." })
    @ApiNotFoundResponse({ description: "Clan not found." })
    @ApiConflictResponse({ description: "User already in a clan or request not in valid state." })
    @Post(":clanId/apply")
    apply(@Req() req: any, @Param("clanId") clanId: string) {
        return this.join.applyToClan({ actorUserId: req.user.userId, clanId });
    }

    @ApiOperation({
        summary: "Invite a user to a clan",
        description: "Creates an INVITE request (clan -> user). Requires clan permission.",
    })
    @ApiParam({ name: "clanId", description: "Target clan ID (Mongo ObjectId)" })
    @ApiOkResponse({ description: "Invite created or auto-accepted." })
    @ApiBadRequestResponse({ description: "Invalid request body or validation error." })
    @ApiForbiddenResponse({ description: "No permission to invite." })
    @ApiNotFoundResponse({ description: "Clan or user not found." })
    @ApiConflictResponse({ description: "Target user already in a clan or request not in valid state." })
    @Post(":clanId/invite")
    invite(@Req() req: any, @Param("clanId") clanId: string, @Body() dto: InviteToClanDto) {
        return this.join.inviteToClan({
            actorUserId: req.user.userId,
            clanId,
            targetUserId: dto.userId,
        });
    }

    @ApiOperation({
        summary: "List my join requests",
        description: "Lists all requests related to the current user (APPLY + INVITE history).",
    })
    @ApiOkResponse({ description: "List of requests for the current user." })
    @Get("requests/me")
    my(@Req() req: any) {
        return this.join.listMyRequests(req.user.userId);
    }

    @ApiOperation({
        summary: "List pending requests for a clan",
        description: "Lists PENDING requests for a clan (requires clan permission).",
    })
    @ApiParam({ name: "clanId", description: "Clan ID (Mongo ObjectId)" })
    @ApiOkResponse({ description: "Pending requests for the clan." })
    @ApiForbiddenResponse({ description: "No permission." })
    @ApiNotFoundResponse({ description: "Clan not found." })
    @Get(":clanId/requests")
    clanPending(@Req() req: any, @Param("clanId") clanId: string) {
        return this.join.listClanPendingRequests({ actorUserId: req.user.userId, clanId });
    }

    @ApiOperation({
        summary: "Accept a request",
        description: "Accepts an INVITE (by invited user) or an APPLY (by clan admin/owner).",
    })
    @ApiParam({ name: "requestId", description: "Join request ID (Mongo ObjectId)" })
    @ApiOkResponse({ description: "Request accepted." })
    @ApiForbiddenResponse({ description: "Not allowed." })
    @ApiNotFoundResponse({ description: "Request not found." })
    @ApiConflictResponse({ description: "Request is not pending or user already in a clan." })
    @Post("requests/:requestId/accept")
    accept(@Req() req: any, @Param("requestId") requestId: string) {
        return this.join.acceptRequest({ actorUserId: req.user.userId, requestId });
    }

    @ApiOperation({
        summary: "Reject a request",
        description: "Rejects an INVITE (by invited user) or an APPLY (by clan admin/owner).",
    })
    @ApiParam({ name: "requestId", description: "Join request ID (Mongo ObjectId)" })
    @ApiOkResponse({ description: "Request rejected." })
    @ApiForbiddenResponse({ description: "Not allowed." })
    @ApiNotFoundResponse({ description: "Request not found." })
    @ApiConflictResponse({ description: "Request is not pending." })
    @Post("requests/:requestId/reject")
    reject(@Req() req: any, @Param("requestId") requestId: string) {
        return this.join.rejectRequest({ actorUserId: req.user.userId, requestId });
    }

    @ApiOperation({
        summary: "Cancel a request",
        description: "Cancels a PENDING request. Only the creator can cancel it.",
    })
    @ApiParam({ name: "requestId", description: "Join request ID (Mongo ObjectId)" })
    @ApiOkResponse({ description: "Request cancelled." })
    @ApiForbiddenResponse({ description: "Not allowed." })
    @ApiNotFoundResponse({ description: "Request not found." })
    @ApiConflictResponse({ description: "Request is not pending." })
    @Post("requests/:requestId/cancel")
    cancel(@Req() req: any, @Param("requestId") requestId: string) {
        return this.join.cancelRequest({ actorUserId: req.user.userId, requestId });
    }
}
