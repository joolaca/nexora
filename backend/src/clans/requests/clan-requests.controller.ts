// backend/src/clans/requests/clans-requests.controller.ts
import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/jwt-auth.guard";
import { ClanRequestsService } from "./clan-requests.service";
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

@ApiTags("Clan Requests")
@ApiBearerAuth("access-token")
@ApiUnauthorizedResponse({ description: "Missing, invalid, or expired token." })
@UseGuards(JwtAuthGuard)
@Controller("clans")
export class ClanRequestsController {
    constructor(private readonly reqs: ClanRequestsService) {}

    @ApiOperation({
        summary: "Apply to a clans",
        description: "Creates an APPLY request (user -> clans). If an INVITE exists, it may auto-accept.",
    })
    @ApiParam({ name: "clanId", description: "Target clans ID (Mongo ObjectId)" })
    @ApiOkResponse({ description: "Request created or auto-accepted." })
    @ApiNotFoundResponse({ description: "Clan not found." })
    @ApiConflictResponse({ description: "User already in a clans or request not in valid state." })
    @Post(":clanId/apply")
    apply(@Req() req: any, @Param("clanId") clanId: string) {
        return this.reqs.applyToClan({ actorUserId: req.user.userId, clanId });
    }

    @ApiOperation({
        summary: "Invite a user to a clans",
        description: "Creates an INVITE request (clans -> user). Requires clans permission.",
    })
    @ApiParam({ name: "clanId", description: "Target clans ID (Mongo ObjectId)" })
    @ApiOkResponse({ description: "Invite created or auto-accepted." })
    @ApiBadRequestResponse({ description: "Invalid request body or validation error." })
    @ApiForbiddenResponse({ description: "No permission to invite." })
    @ApiNotFoundResponse({ description: "Clan or user not found." })
    @ApiConflictResponse({ description: "Target user already in a clans or request not in valid state." })
    @Post(":clanId/invite")
    invite(@Req() req: any, @Param("clanId") clanId: string, @Body() dto: InviteToClanDto) {
        return this.reqs.inviteToClan({
            actorUserId: req.user.userId,
            clanId,
            targetUserId: dto.userId,
        });
    }

    @ApiOperation({
        summary: "List my requests",
        description: "Lists all requests related to the current user (APPLY + INVITE history).",
    })
    @ApiOkResponse({ description: "List of requests for the current user." })
    @Get("requests/me")
    my(@Req() req: any) {
        return this.reqs.listMyRequests(req.user.userId);
    }

    @ApiOperation({
        summary: "List pending requests for a clans",
        description: "Lists PENDING requests for a clans (requires clans permission).",
    })
    @ApiParam({ name: "clanId", description: "Clan ID (Mongo ObjectId)" })
    @ApiOkResponse({ description: "Pending requests for the clans." })
    @ApiForbiddenResponse({ description: "No permission." })
    @ApiNotFoundResponse({ description: "Clan not found." })
    @Get(":clanId/requests")
    clanPending(@Req() req: any, @Param("clanId") clanId: string) {
        return this.reqs.listClanPendingRequests({ actorUserId: req.user.userId, clanId });
    }

    @ApiOperation({
        summary: "Accept a request",
        description: "Accepts an INVITE (by invited user) or an APPLY (by clans admin/owner).",
    })
    @ApiParam({ name: "requestId", description: "Join request ID (Mongo ObjectId)" })
    @ApiOkResponse({ description: "Request accepted." })
    @ApiForbiddenResponse({ description: "Not allowed." })
    @ApiNotFoundResponse({ description: "Request not found." })
    @ApiConflictResponse({ description: "Request is not pending or user already in a clans." })
    @Post("requests/:requestId/accept")
    accept(@Req() req: any, @Param("requestId") requestId: string) {
        return this.reqs.acceptRequest({ actorUserId: req.user.userId, requestId });
    }

    @ApiOperation({
        summary: "Reject a request",
        description: "Rejects an INVITE (by invited user) or an APPLY (by clans admin/owner).",
    })
    @ApiParam({ name: "requestId", description: "Join request ID (Mongo ObjectId)" })
    @ApiOkResponse({ description: "Request rejected." })
    @ApiForbiddenResponse({ description: "Not allowed." })
    @ApiNotFoundResponse({ description: "Request not found." })
    @ApiConflictResponse({ description: "Request is not pending." })
    @Post("requests/:requestId/reject")
    reject(@Req() req: any, @Param("requestId") requestId: string) {
        return this.reqs.rejectRequest({ actorUserId: req.user.userId, requestId });
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
        return this.reqs.cancelRequest({ actorUserId: req.user.userId, requestId });
    }
}
