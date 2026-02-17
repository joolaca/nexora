// backend/src/users/users.controller.ts
import { Body, Controller, Get, Patch, Query, Req, UseGuards, BadRequestException } from "@nestjs/common";
import { UsersService } from "./users.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { UpdateMeDto } from "./dto/update-me.dto";
import { ListUsersDto } from "./dto/list-users.dto";
import {
    ApiBearerAuth,
    ApiBadRequestResponse,
    ApiConflictResponse,
    ApiForbiddenResponse,
    ApiOkResponse,
    ApiOperation,
    ApiQuery,
    ApiTags,
    ApiUnauthorizedResponse,
} from "@nestjs/swagger";

@ApiTags("Users")
@ApiBearerAuth("access-token")
@ApiUnauthorizedResponse({ description: "Missing, invalid, or expired token." })
@UseGuards(JwtAuthGuard)
@Controller("users")
export class UsersController {
    constructor(private readonly users: UsersService) {}

    @ApiOperation({
        summary: "Update my profile",
        description: "Updates the current user's username and/or password (requires currentPassword).",
    })
    @ApiOkResponse({ description: "Profile updated successfully." })
    @ApiBadRequestResponse({ description: "Nothing to update / invalid body / user not found." })
    @ApiConflictResponse({ description: "Username already taken." })
    @ApiForbiddenResponse({ description: "Not allowed." })
    @Patch("me")
    async updateMe(@Req() req: any, @Body() dto: UpdateMeDto) {
        if (!dto.newUsername && !dto.newPassword) {
            throw new BadRequestException("Nothing to update");
        }

        const userId = req.user.userId;
        return this.users.updateMe(userId, dto);
    }

    @ApiOperation({
        summary: "List users",
        description: "Returns a paginated list of users with optional sorting and filters.",
    })
    @ApiOkResponse({ description: "Paginated users list." })
    @ApiBadRequestResponse({ description: "Invalid query parameters." })
    // Swagger-friendly query docs (shows up nicely in UI)
    @ApiQuery({ name: "limit", required: false, type: Number, example: 20, description: "Page size (1-100)." })
    @ApiQuery({ name: "page", required: false, type: Number, example: 1, description: "Page number (>= 1)." })
    @ApiQuery({
        name: "sort",
        required: false,
        enum: ["rank_desc", "rank_asc", "username_asc", "username_desc"],
        example: "rank_desc",
        description: "Sort order.",
    })
    @ApiQuery({ name: "minRank", required: false, type: Number, example: 0, description: "Minimum rank filter." })
    @ApiQuery({ name: "maxRank", required: false, type: Number, example: 500, description: "Maximum rank filter." })
    @ApiQuery({
        name: "clan",
        required: false,
        enum: ["any", "in", "none"],
        example: "any",
        description: 'Clan filter: "in" = has clans, "none" = no clans, "any" = no filter.',
    })
    @Get()
    async list(@Query() q: ListUsersDto) {
        return this.users.listUsers({
            limit: q.limit,
            page: q.page,
            sort: q.sort,
            minRank: q.minRank,
            maxRank: q.maxRank,
            clan: q.clan,
        });
    }
}
