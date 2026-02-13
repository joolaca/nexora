// backend/src/clans/clans.controller.ts
import { Body, Controller, Get, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CreateClanDto } from "./dto/create-clan.dto";
import { EditClanDto } from "./dto/edit-clan.dto";
import { ClansService } from "./clans.service";
import {
    ApiBearerAuth,
    ApiBadRequestResponse,
    ApiConflictResponse,
    ApiForbiddenResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
    ApiUnauthorizedResponse,
    ApiNotFoundResponse,
} from "@nestjs/swagger";

@ApiTags("Clans")
@ApiBearerAuth("access-token")
@ApiUnauthorizedResponse({ description: "Missing, invalid, or expired token." })
@UseGuards(JwtAuthGuard)
@Controller("clans")
export class ClansController {
    constructor(private clans: ClansService) {}

    @ApiOperation({
        summary: "Get my clan",
        description: "Returns the clan where the current user is a member.",
    })
    @ApiOkResponse({ description: "My clan details." })
    @ApiNotFoundResponse({ description: "Clan not found (user is not in a clan)." })
    @Get("me")
    me(@Req() req: any) {
        return this.clans.getMyClan(req.user.userId);
    }

    @ApiOperation({
        summary: "Create clan",
        description: "Creates a new clan and sets the current user as the owner.",
    })
    @ApiOkResponse({ description: "Clan created successfully." })
    @ApiBadRequestResponse({ description: "Invalid request body or validation error." })
    @ApiConflictResponse({ description: "Slug already taken or invalid slug." })
    @Post()
    create(@Req() req: any, @Body() dto: CreateClanDto) {
        return this.clans.createClan(req.user.userId, dto);
    }

    @ApiOperation({
        summary: "Update my clan",
        description: "Updates the current user's clan (requires proper permissions).",
    })
    @ApiOkResponse({ description: "Clan updated successfully." })
    @ApiBadRequestResponse({ description: "Nothing to update or validation error." })
    @ApiForbiddenResponse({ description: "No permission or not a clan member." })
    @ApiNotFoundResponse({ description: "Clan not found." })
    @ApiConflictResponse({ description: "Slug already taken or invalid slug." })
    @Patch()
    update(@Req() req: any, @Body() dto: EditClanDto) {
        return this.clans.editClan(req.user.userId, dto);
    }
}