import { Body, Controller, Get, Patch, Query, UseGuards,Param } from "@nestjs/common";
import { UsersService } from "./users.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { UpdateMeDto } from "./dto/update-me.dto";
import { ListUsersDto } from "./dto/list-users.dto";
import { UserPublicDto } from "./dto/user-public.dto";

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
    ApiParam
} from "@nestjs/swagger";
import { AppException } from "../common/errors/app-exception";
import { CurrentUser } from "../common/decorators/current-user.decorator";

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
    async updateMe(
        @CurrentUser() user: { userId: string },
        @Body() dto: UpdateMeDto,
    ) {
        if (!dto.newUsername && !dto.newPassword) {
            throw new AppException(400, "NOTHING_TO_UPDATE", {
                kind: "validation",
            });
        }

        return this.users.updateMe(user.userId, dto);
    }

    @ApiOperation({
        summary: "List users",
        description: "Returns a paginated list of users with optional sorting and filters.",
    })
    @ApiOkResponse({ description: "Paginated users list." })
    @ApiBadRequestResponse({ description: "Invalid query parameters." })
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



    @ApiOperation({
        summary: "Get public user data",
        description: "Returns public profile data of a user.",
    })
    @ApiOkResponse({ type: UserPublicDto })
    @ApiParam({
        name: "userId",
        example: "65f1c8a2...",
    })
    @Get(":userId/public")
    async getPublicUser(@Param("userId") userId: string) {
        return this.users.getPublicUser(userId);
    }

}
